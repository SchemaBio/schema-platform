'use client';

import * as React from 'react';
import { Button, Input, FormItem, Modal, ModalHeader, ModalBody, ModalFooter } from '@schema/ui-kit';
import { Camera, Lock, Save } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
}

interface ProfileSettingsProps {
  user: User;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [formData, setFormData] = React.useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
  const [signatureImage, setSignatureImage] = React.useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = React.useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    // 模拟保存
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert('个人信息已保存');
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('密码长度至少6位');
      return;
    }
    // 模拟修改密码
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsPasswordModalOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('密码修改成功');
  };

  return (
    <div className="space-y-8">
      {/* 基本信息 */}
      <section>
        <h3 className="text-base font-medium text-fg-default mb-4">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <FormItem label="姓名" required>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="请输入姓名"
            />
          </FormItem>
          <FormItem label="邮箱">
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="请输入邮箱"
            />
          </FormItem>
          <FormItem label="手机号">
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="请输入手机号"
            />
          </FormItem>
        </div>
      </section>

      {/* 签名图片 */}
      <section>
        <h3 className="text-base font-medium text-fg-default mb-4">签名图片</h3>
        <div className="flex items-start gap-4">
          <div className="w-48 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-canvas-subtle overflow-hidden">
            {signatureImage ? (
              <img src={signatureImage} alt="签名" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-fg-muted text-sm">暂无签名</span>
            )}
          </div>
          <div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="hidden"
              />
              <Button variant="secondary" leftIcon={<Camera className="w-4 h-4" />} type="button">
                上传签名
              </Button>
            </label>
            <p className="text-xs text-fg-muted mt-2">支持 JPG、PNG 格式，建议尺寸 200x100</p>
          </div>
        </div>
      </section>

      {/* 安全设置 */}
      <section>
        <h3 className="text-base font-medium text-fg-default mb-4">安全设置</h3>
        <Button
          variant="secondary"
          leftIcon={<Lock className="w-4 h-4" />}
          onClick={() => setIsPasswordModalOpen(true)}
        >
          修改密码
        </Button>
      </section>

      {/* 保存按钮 */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSaveProfile}
          loading={saving}
        >
          保存修改
        </Button>
      </div>

      {/* 修改密码弹窗 */}
      <Modal open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} size="small">
        <ModalHeader>修改密码</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <FormItem label="当前密码" required>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="请输入当前密码"
              />
            </FormItem>
            <FormItem label="新密码" required>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="请输入新密码（至少6位）"
              />
            </FormItem>
            <FormItem label="确认新密码" required>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="请再次输入新密码"
              />
            </FormItem>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleChangePassword}>
            确认修改
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
