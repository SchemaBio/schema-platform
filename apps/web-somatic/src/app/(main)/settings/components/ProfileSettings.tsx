'use client';

import * as React from 'react';
import { Button, Input, FormItem, Modal, ModalHeader, ModalBody, ModalFooter } from '@schema/ui-kit';
import { Camera, Lock, Save, Loader2 } from 'lucide-react';

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

/**
 * 移除图片背景（适用于白底/浅色底签名）
 * 使用 Canvas 进行颜色阈值处理，将浅色背景变为透明
 */
async function removeBackground(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法创建 Canvas 上下文'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // 阈值：RGB 值都大于此值的像素视为背景（白色/浅色）
          const threshold = 240;
          // 边缘平滑阈值
          const edgeThreshold = 200;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 计算亮度
            const brightness = (r + g + b) / 3;

            if (r > threshold && g > threshold && b > threshold) {
              // 完全透明（白色背景）
              data[i + 3] = 0;
            } else if (brightness > edgeThreshold) {
              // 半透明过渡（边缘平滑）
              const alpha = Math.round(255 * (1 - (brightness - edgeThreshold) / (255 - edgeThreshold)));
              data[i + 3] = Math.min(data[i + 3], alpha);
            }
            // 其他像素保持不变
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 读取文件为 DataURL（不处理背景）
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [formData, setFormData] = React.useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
  const [signatureImage, setSignatureImage] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
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

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      // 尝试移除背景
      const processedImage = await removeBackground(file);
      setSignatureImage(processedImage);
    } catch (error) {
      console.warn('背景移除失败，使用原图:', error);
      // 失败时使用原图
      try {
        const originalImage = await readFileAsDataURL(file);
        setSignatureImage(originalImage);
      } catch {
        alert('图片处理失败，请重试');
      }
    } finally {
      setIsProcessing(false);
      // 重置 input 以便可以重新选择同一文件
      e.target.value = '';
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
          <div 
            className="w-48 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden"
            style={{ 
              backgroundColor: signatureImage ? 'transparent' : undefined,
              backgroundImage: signatureImage ? 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)' : undefined,
              backgroundSize: '10px 10px',
              backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
            }}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 text-fg-muted">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">处理中...</span>
              </div>
            ) : signatureImage ? (
              <img src={signatureImage} alt="签名" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-fg-muted text-sm">暂无签名</span>
            )}
          </div>
          <div>
            <label className="cursor-pointer inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <span
                className={`
                  inline-flex items-center justify-center gap-1.5
                  h-8 px-4 text-sm font-medium
                  rounded-md border
                  bg-canvas-subtle text-fg-default border-border-default
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-canvas-inset cursor-pointer'}
                  transition-colors duration-150
                `}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {isProcessing ? '处理中...' : '上传签名'}
              </span>
            </label>
            <p className="text-xs text-fg-muted mt-2">支持 JPG、PNG 格式，建议尺寸 200x100</p>
            <p className="text-xs text-fg-muted">系统会自动去除白色/浅色背景</p>
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
