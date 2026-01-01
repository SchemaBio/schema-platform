'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Plus, ChevronRight, ChevronLeft, List, X, UserPlus, GitBranch, Trash2, Pencil, Save } from 'lucide-react';
import { PedigreeTree, MemberDetailPanel, AddMemberModal, LinkSampleModal, NewPedigreeModal } from './components';
import type { NewPedigreeFormData } from './components/NewPedigreeModal';
import { mockPedigreeList, getPedigreeDetail } from './mock-data';
import type { PedigreeListItem, Pedigree, PedigreeMember } from './types';

interface OpenTab {
  id: string;
  pedigreeId: string;
  name: string;
}

export default function PedigreePage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);

  // 当前查看的家系详情
  const [currentPedigree, setCurrentPedigree] = React.useState<Pedigree | null>(null);
  const [loading, setLoading] = React.useState(false);

  // 选中的成员
  const [selectedMember, setSelectedMember] = React.useState<PedigreeMember | null>(null);

  // 添加成员弹窗
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);

  // 编辑模式
  const [isEditMode, setIsEditMode] = React.useState(false);

  // 关联样本弹窗
  const [isLinkSampleOpen, setIsLinkSampleOpen] = React.useState(false);
  const [linkingMemberId, setLinkingMemberId] = React.useState<string | null>(null);

  // 新建家系弹窗
  const [isNewPedigreeOpen, setIsNewPedigreeOpen] = React.useState(false);

  // 防止重复打开家系
  const processedPedigreeId = React.useRef<string | null>(null);

  // 处理 URL 参数，自动打开对应家系
  React.useEffect(() => {
    const pedigreeId = searchParams.get('id');
    if (pedigreeId && pedigreeId !== processedPedigreeId.current) {
      processedPedigreeId.current = pedigreeId;
      const pedigree = mockPedigreeList.find(p => p.id === pedigreeId);
      if (pedigree) {
        handleOpenTabById(pedigreeId, pedigree.name);
      }
    }
  }, [searchParams]);

  // 通过 ID 打开家系标签
  const handleOpenTabById = async (pedigreeId: string, name: string) => {
    const existingTab = openTabs.find(t => t.pedigreeId === pedigreeId);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      setLoading(true);
      const detail = await getPedigreeDetail(pedigreeId);
      setCurrentPedigree(detail);
      setLoading(false);
      return;
    }

    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      pedigreeId,
      name,
    };
    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);

    setLoading(true);
    const detail = await getPedigreeDetail(pedigreeId);
    setCurrentPedigree(detail);
    setLoading(false);
    setSelectedMember(null);
  };

  // 打开家系详情标签
  const handleOpenTab = React.useCallback(async (pedigree: PedigreeListItem) => {
    const existingTab = openTabs.find(t => t.pedigreeId === pedigree.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      // 加载详情
      setLoading(true);
      const detail = await getPedigreeDetail(pedigree.id);
      setCurrentPedigree(detail);
      setLoading(false);
      return;
    }

    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      pedigreeId: pedigree.id,
      name: pedigree.name,
    };
    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    
    // 加载详情
    setLoading(true);
    const detail = await getPedigreeDetail(pedigree.id);
    setCurrentPedigree(detail);
    setLoading(false);
    setSelectedMember(null);
  }, [openTabs]);

  // 切换标签
  const handleSwitchTab = React.useCallback(async (tabId: string) => {
    setActiveTabId(tabId);
    const tab = openTabs.find(t => t.id === tabId);
    if (tab) {
      setLoading(true);
      const detail = await getPedigreeDetail(tab.pedigreeId);
      setCurrentPedigree(detail);
      setLoading(false);
      setSelectedMember(null);
    }
  }, [openTabs]);

  // 关闭标签
  const handleCloseTab = React.useCallback((tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        setActiveTabId(lastTab.id);
        getPedigreeDetail(lastTab.pedigreeId).then(setCurrentPedigree);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
        setCurrentPedigree(null);
      }
      return newTabs;
    });
    setSelectedMember(null);
  }, [activeTabId]);

  // 添加成员
  const handleAddMember = (memberData: Omit<PedigreeMember, 'id' | 'generation' | 'position'>) => {
    if (!currentPedigree) return;
    
    const newMember: PedigreeMember = {
      ...memberData,
      id: `M${Date.now()}`,
      generation: memberData.fatherId || memberData.motherId 
        ? (currentPedigree.members.find(m => m.id === memberData.fatherId)?.generation ?? 0) + 1
        : 0,
      position: currentPedigree.members.filter(m => m.generation === 0).length,
    };
    
    setCurrentPedigree(prev => prev ? {
      ...prev,
      members: [...prev.members, newMember],
    } : null);
  };

  // 打开关联样本弹窗
  const handleOpenLinkSample = (memberId: string) => {
    setLinkingMemberId(memberId);
    setIsLinkSampleOpen(true);
  };

  // 关联样本到成员
  const handleLinkSample = (sampleId: string) => {
    if (!currentPedigree || !linkingMemberId) return;

    setCurrentPedigree(prev => prev ? {
      ...prev,
      members: prev.members.map(m =>
        m.id === linkingMemberId ? { ...m, sampleId } : m
      ),
    } : null);

    // 更新选中成员
    if (selectedMember?.id === linkingMemberId) {
      setSelectedMember(prev => prev ? { ...prev, sampleId } : null);
    }

    setLinkingMemberId(null);
  };

  // 创建新家系
  const handleCreatePedigree = (data: NewPedigreeFormData) => {
    const newPedigreeId = `FAM${String(mockPedigreeList.length + 1).padStart(3, '0')}`;
    const newMemberId = `M${Date.now()}`;

    const newPedigree: Pedigree = {
      id: newPedigreeId,
      name: data.name,
      probandId: newMemberId,
      disease: data.disease || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      note: data.note || undefined,
      members: [
        {
          id: newMemberId,
          name: data.probandName,
          gender: data.probandGender,
          birthYear: data.probandBirthYear ? parseInt(data.probandBirthYear) : undefined,
          relation: 'proband',
          affectedStatus: 'affected',
          generation: 0,
          position: 0,
        },
      ],
    };

    // 打开新创建的家系
    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      pedigreeId: newPedigreeId,
      name: data.name,
    };
    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setCurrentPedigree(newPedigree);
    setSelectedMember(null);
    setIsEditMode(true); // 自动进入编辑模式

    console.log('创建新家系:', newPedigree);
  };

  // 筛选家系
  const filteredPedigrees = React.useMemo(() => {
    if (!searchQuery) return mockPedigreeList;
    const query = searchQuery.toLowerCase();
    return mockPedigreeList.filter(
      (p) => p.id.toLowerCase().includes(query) || 
             p.name.includes(query) || 
             p.probandName.includes(query)
    );
  }, [searchQuery]);

  // 表格列定义
  const columns: Column<PedigreeListItem>[] = [
    {
      id: 'id',
      header: '家系编号',
      accessor: (row) => (
        <span
          className="text-accent-fg hover:underline cursor-pointer"
          onClick={(e) => { e.stopPropagation(); handleOpenTab(row); }}
        >
          {row.id}
        </span>
      ),
      width: 100,
    },
    {
      id: 'sampleIds',
      header: '样本编号',
      accessor: (row) => (
        <div className="text-sm">
          {row.sampleIds.length > 0 ? (
            row.sampleIds.map((id) => (
              <div
                key={id}
                className={id === row.probandSampleId ? 'text-accent-fg font-medium' : 'text-fg-default'}
              >
                {id}{id === row.probandSampleId && ' (先证者)'}
              </div>
            ))
          ) : '-'}
        </div>
      ),
      width: 160,
    },
    { id: 'probandName', header: '先证者', accessor: 'probandName', width: 80 },
    { id: 'disease', header: '主要疾病', accessor: (row) => row.disease || '-', width: 140 },
    {
      id: 'memberCount',
      header: '成员数',
      accessor: (row) => (
        <div className="text-fg-default">
          {row.memberCount} 人
          <span className="text-xs text-fg-muted ml-1">({row.sampledCount} 已采样)</span>
        </div>
      ),
      width: 130
    },
    { id: 'updatedAt', header: '更新时间', accessor: 'updatedAt', width: 100 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <button
            className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            onClick={() => console.log('删除', row.id)}
            aria-label="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: 60,
    },
  ];

  const activeTab = openTabs.find(t => t.id === activeTabId);
  const hasOpenTabs = openTabs.length > 0;

  return (
    <div className="flex h-full">
      {/* 左侧家系列表 */}
      {hasOpenTabs ? (
        sidebarCollapsed ? (
          <div className="w-10 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col items-center py-2">
            <button onClick={() => setSidebarCollapsed(false)} className="p-2 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors" title="展开家系列表">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="mt-2 text-xs text-fg-muted writing-mode-vertical">家系</div>
            <div className="mt-auto mb-2 w-5 h-5 rounded-full bg-accent-emphasis text-white text-xs flex items-center justify-center">{openTabs.length}</div>
          </div>
        ) : (
          <div className="w-56 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col">
            <div className="px-3 py-2 border-b border-border-default flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-fg-muted" />
                <span className="text-sm font-medium text-fg-default">家系列表</span>
              </div>
              <button onClick={() => setSidebarCollapsed(true)} className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors" title="收起">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 border-b border-border-default">
              <Input placeholder="搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftElement={<Search className="w-3.5 h-3.5" />} className="text-xs" />
            </div>
            <div className="flex-1 overflow-auto">
              {filteredPedigrees.map((pedigree) => {
                const isOpen = openTabs.some(t => t.pedigreeId === pedigree.id);
                const isActive = activeTab?.pedigreeId === pedigree.id;
                return (
                  <div key={pedigree.id} onClick={() => handleOpenTab(pedigree)} className={`px-3 py-2 cursor-pointer border-b border-border-muted transition-colors ${isActive ? 'bg-accent-subtle border-l-2 border-l-accent-emphasis' : isOpen ? 'bg-canvas-inset' : 'hover:bg-canvas-inset'}`}>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3 h-3 text-fg-muted" />
                      <span className={`text-sm ${isActive ? 'text-accent-fg font-medium' : 'text-fg-default'}`}>{pedigree.id}</span>
                    </div>
                    <div className="text-xs text-fg-muted ml-5 truncate">{pedigree.name} · {pedigree.memberCount}人</div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <div className="flex-1">
          <div className="p-6 h-full overflow-auto">
            <h2 className="text-lg font-medium text-fg-default mb-4">家系管理</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="w-64">
                <Input placeholder="搜索家系编号、名称、先证者..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftElement={<Search className="w-4 h-4" />} />
              </div>
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewPedigreeOpen(true)}>新建家系</Button>
            </div>
            <DataTable data={filteredPedigrees} columns={columns} rowKey="id" striped density="compact" />
          </div>
        </div>
      )}

      {/* 中间家系树区域 */}
      {hasOpenTabs && (
        <div className="flex-1 flex flex-col min-w-0">
          {/* 标签栏 */}
          <div className="flex items-center border-b border-border-default bg-canvas-subtle overflow-x-auto flex-shrink-0">
            {openTabs.map((tab) => (
              <div key={tab.id} onClick={() => handleSwitchTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-border-muted text-sm whitespace-nowrap transition-colors ${activeTabId === tab.id ? 'bg-canvas-default text-fg-default border-b-2 border-b-accent-emphasis -mb-px' : 'text-fg-muted hover:bg-canvas-inset hover:text-fg-default'}`}>
                <span>{tab.name}</span>
                <button onClick={(e) => handleCloseTab(tab.id, e)} className="p-0.5 rounded hover:bg-canvas-inset" aria-label="关闭标签">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* 工具栏 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-default bg-canvas-subtle">
            <div className="flex items-center gap-2">
              {currentPedigree && (
                <>
                  <span className="text-sm text-fg-default font-medium">{currentPedigree.name}</span>
                  {currentPedigree.disease && (
                    <Tag variant="info">{currentPedigree.disease}</Tag>
                  )}
                  <span className="text-xs text-fg-muted">{currentPedigree.members.length} 位成员</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Button variant="secondary" size="small" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setIsAddMemberOpen(true)}>
                    添加成员
                  </Button>
                  <Button variant="primary" size="small" leftIcon={<Save className="w-4 h-4" />} onClick={() => setIsEditMode(false)}>
                    完成编辑
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="small" leftIcon={<Pencil className="w-4 h-4" />} onClick={() => setIsEditMode(true)}>
                  编辑
                </Button>
              )}
            </div>
          </div>

          {/* 家系树 */}
          <div className="flex-1 overflow-hidden relative">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
              </div>
            ) : currentPedigree ? (
              <PedigreeTree
                members={currentPedigree.members}
                probandId={currentPedigree.probandId}
                selectedMemberId={selectedMember?.id}
                onSelectMember={setSelectedMember}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-fg-muted">
                选择一个家系查看详情
              </div>
            )}
          </div>
        </div>
      )}

      {/* 右侧成员详情面板 */}
      {selectedMember && (
        <MemberDetailPanel
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onLinkSample={handleOpenLinkSample}
          onRemoveMember={(memberId) => {
            if (currentPedigree) {
              setCurrentPedigree(prev => prev ? {
                ...prev,
                members: prev.members.filter(m => m.id !== memberId),
              } : null);
              setSelectedMember(null);
            }
          }}
        />
      )}

      {/* 添加成员弹窗 */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSubmit={handleAddMember}
        existingMembers={currentPedigree?.members || []}
      />

      {/* 关联样本弹窗 */}
      <LinkSampleModal
        isOpen={isLinkSampleOpen}
        onClose={() => {
          setIsLinkSampleOpen(false);
          setLinkingMemberId(null);
        }}
        onSelect={handleLinkSample}
        memberName={currentPedigree?.members.find(m => m.id === linkingMemberId)?.name || ''}
      />

      {/* 新建家系弹窗 */}
      <NewPedigreeModal
        isOpen={isNewPedigreeOpen}
        onClose={() => setIsNewPedigreeOpen(false)}
        onSubmit={handleCreatePedigree}
      />
    </div>
  );
}
