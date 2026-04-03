'use client';

import { Shield, AlertTriangle, Database, Users, Scale, Lock } from 'lucide-react';
import { PageContent } from '@/components/layout';

export default function PrivacyPage() {
  return (
    <PageContent>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-fg-default mb-2">隐私协议与免责声明</h1>
          <p className="text-fg-muted">数据安全与合规使用指南</p>
        </div>

        {/* 重要提示 */}
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">重要提示</h3>
              <p className="text-sm text-red-700 leading-relaxed">
                本平台处理人类遗传资源数据，请确保您的使用符合《中华人民共和国人类遗传资源管理条例》及相关法律法规要求。
                敏感数据建议部署在本地/内网环境，避免公网暴露。
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 使用范围声明 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-fg-muted" />
              <h2 className="text-sm font-medium text-fg-default">使用范围声明</h2>
            </div>
            <div className="space-y-3 text-sm text-fg-muted leading-relaxed">
              <p>
                本平台<strong className="text-fg-default">仅供科学研究使用，不作为临床诊断依据</strong>。
                任何基于本平台分析结果做出的医学决策，应由具有相应资质的专业人员独立判断。
              </p>
              <p>
                平台输出结果仅作为研究参考，不构成医疗建议、诊断或治疗方案。
              </p>
            </div>
          </section>

          {/* 用户责任 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-fg-muted" />
              <h2 className="text-sm font-medium text-fg-default">用户责任</h2>
            </div>
            <p className="text-sm text-fg-muted leading-relaxed mb-3">
              用户必须确保遵守所在地区关于遗传数据的法律法规，包括但不限于：
            </p>
            <ul className="text-sm text-fg-muted space-y-2 list-disc list-inside">
              <li>
                <strong className="text-fg-default">数据隐私法规</strong>：
                遵守《个人信息保护法》《数据安全法》等数据保护相关法律
              </li>
              <li>
                <strong className="text-fg-default">人类遗传资源管理</strong>：
                遵守《人类遗传资源管理条例》及《人类遗传资源管理条例实施细则》
              </li>
              <li>
                <strong className="text-fg-default">伦理审查要求</strong>：
                涉及人体研究的项目应通过伦理委员会审查
              </li>
              <li>
                <strong className="text-fg-default">知情同意</strong>：
                样本采集和数据使用应获得受检者的知情同意
              </li>
            </ul>
          </section>

          {/* 中国人类遗传资源管理特别说明 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-fg-muted" />
              <h2 className="text-sm font-medium text-fg-default">中国人类遗传资源管理特别说明</h2>
            </div>
            <p className="text-sm text-fg-muted leading-relaxed mb-3">
              根据《中华人民共和国人类遗传资源管理条例》，使用人类遗传资源需注意：
            </p>
            <ul className="text-sm text-fg-muted space-y-2 list-disc list-inside">
              <li>
                采集人类遗传资源应通过伦理审查，并获得提供者的书面知情同意
              </li>
              <li>
                保藏人类遗传资源需向国务院科学技术行政部门备案
              </li>
              <li>
                将人类遗传资源材料出境，需经国务院科学技术行政部门审批
              </li>
              <li>
                将人类遗传资源信息出境，需向国务院科学技术行政部门备案并提交信息备份
              </li>
              <li>
                国际合作研究需进行审批或备案
              </li>
            </ul>
            <p className="text-sm text-fg-muted leading-relaxed mt-3">
              详细规定请参考：
              <a
                href="http://www.most.gov.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                中国科技部人类遗传资源管理专栏
              </a>
            </p>
          </section>

          {/* 数据安全建议 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-fg-muted" />
              <h2 className="text-sm font-medium text-fg-default">数据安全建议</h2>
            </div>
            <ul className="text-sm text-fg-muted space-y-2 list-disc list-inside">
              <li>
                建议在本地或内网环境中部署本平台，避免将敏感数据暴露于公网
              </li>
              <li>
                建议使用加密存储和传输，确保数据安全
              </li>
              <li>
                建议定期备份数据，并制定数据恢复预案
              </li>
              <li>
                建议建立访问控制机制，限制敏感数据的访问权限
              </li>
              <li>
                建议记录数据操作日志，便于审计追溯
              </li>
            </ul>
          </section>

          {/* 风险与规避 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <h2 className="text-sm font-medium text-fg-default mb-3">风险类型与规避方式</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-fg-muted font-medium">风险类型</th>
                    <th className="text-left py-2 text-fg-muted font-medium">规避方式</th>
                  </tr>
                </thead>
                <tbody className="text-fg-muted">
                  <tr className="border-b border-border">
                    <td className="py-2">数据合规风险</td>
                    <td className="py-2">明确声明用户自行负责遵守相关法律法规</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2">医疗责任风险</td>
                    <td className="py-2">声明"仅供研究，不作临床诊断依据"</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2">知识产权风险</td>
                    <td className="py-2">保留版权，采用 Apache 2.0 开源协议</td>
                  </tr>
                  <tr>
                    <td className="py-2">第三方依赖风险</td>
                    <td className="py-2">检查依赖库许可证兼容性</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 免责声明 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <h2 className="text-sm font-medium text-fg-default mb-3">免责声明</h2>
            <div className="space-y-3 text-sm text-fg-muted leading-relaxed">
              <p>
                本平台以"现状"提供，不提供任何形式的明示或暗示担保。
              </p>
              <p>
                开发方不对以下情况承担责任：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>因使用本平台导致的任何直接或间接损失</li>
                <li>分析结果的准确性、完整性或适用性</li>
                <li>用户违反法律法规导致的任何后果</li>
                <li>数据泄露、丢失或其他安全问题</li>
              </ul>
              <p>
                以上声明不能完全免除法律责任，但表明开发方已尽到告知义务。
              </p>
            </div>
          </section>

          {/* 版权与许可 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <h2 className="text-sm font-medium text-fg-default mb-3">版权与开源许可</h2>
            <p className="text-sm text-fg-muted leading-relaxed">
              本平台采用 Apache License 2.0 开源协议。
              用户可自由使用、修改和分发，但需保留原作者版权声明。
            </p>
          </section>

          {/* Footer */}
          <div className="text-center text-xs text-fg-muted pt-4 border-t border-border">
            <p>本协议最后更新：2024年12月</p>
          </div>
        </div>
      </div>
    </PageContent>
  );
}