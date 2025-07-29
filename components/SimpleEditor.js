import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import 'react-quill/dist/quill.snow.css';

// 动态导入避免SSR问题
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-lg" />
  }
);

export default function SimpleEditor({ 
  initialTitle = '',
  initialContent = '',
  onPublish,
  onSaveDraft,
  isPublishing = false,
  autoSave = true
}) {
  const { address } = useAccount();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);

  // 编辑器配置
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  // 计算字数
  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // 自动保存草稿
  const saveDraft = useCallback(async () => {
    if (!autoSave || !address || (!title && !content)) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorAddress: address,
          title: title || 'Untitled',
          content,
          metadata: { wordCount }
        })
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, address, wordCount, autoSave]);

  // 自动保存定时器
  useEffect(() => {
    if (!autoSave) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 3000); // 3秒后自动保存

    return () => clearTimeout(timer);
  }, [title, content, saveDraft, autoSave]);

  // 发布文章
  const handlePublish = async () => {
    if (!title || !content) {
      toast.error('Please add a title and content');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      await onPublish({
        title,
        content,
        authorAddress: address,
        categories: [], // TODO: 添加分类选择
        isDraft: false
      });
      
      toast.success('Article published successfully!');
    } catch (error) {
      toast.error('Failed to publish article');
      console.error('Publish error:', error);
    }
  };

  // 保存为草稿
  const handleSaveDraft = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      if (onSaveDraft) {
        await onSaveDraft({
          title: title || 'Untitled',
          content,
          authorAddress: address,
          isDraft: true
        });
      } else {
        await saveDraft();
      }
      
      toast.success('Draft saved successfully!');
    } catch (error) {
      toast.error('Failed to save draft');
      console.error('Save draft error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 标题输入 */}
      <input
        type="text"
        placeholder="Article title..."
        className="w-full text-4xl font-bold mb-6 p-4 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      {/* 编辑器 */}
      <div className="mb-6">
        <ReactQuill 
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="Write your story..."
          className="min-h-[400px] bg-white"
        />
      </div>

      {/* 底部工具栏 */}
      <div className="flex items-center justify-between py-4 border-t">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{wordCount} words</span>
          {isSaving && <span className="text-blue-600">Saving...</span>}
          {lastSaved && !isSaving && (
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isSaving}
          >
            Save Draft
          </button>
          
          <button
            onClick={handlePublish}
            disabled={!title || !content || isPublishing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPublishing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </span>
            ) : (
              'Publish to IPFS'
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .ql-container {
          font-size: 16px;
          line-height: 1.8;
        }
        
        .ql-editor {
          min-height: 400px;
          padding: 2rem;
        }
        
        .ql-editor h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        
        .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
        }
        
        .ql-editor h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .ql-editor p {
          margin-bottom: 1rem;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .ql-editor pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        
        .ql-editor img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
        }
        
        .ql-snow .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background-color: #f9fafb;
        }
        
        .ql-snow .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}