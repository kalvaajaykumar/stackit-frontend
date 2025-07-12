import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Smile
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  height = "200px"
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  const handleEmojiClick = (emojiObject: any) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      const position = range ? range.index : quill.getLength();
      quill.insertText(position, emojiObject.emoji);
      quill.setSelection(position + 1);
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Custom Toolbar */}
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center space-x-2 flex-wrap">
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                quill?.format('bold', !quill.getFormat().bold);
              }}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                quill?.format('italic', !quill.getFormat().italic);
              }}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                quill?.format('strike', !quill.getFormat().strike);
              }}
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                quill?.format('list', 'ordered');
              }}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                quill?.format('list', 'bullet');
              }}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                quill?.format('align', 'left');
              }}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                quill?.format('align', 'center');
              }}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => {
                const quill = quillRef.current?.getEditor();
                quill?.format('align', 'right');
              }}
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              title="Add Link"
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) {
                  const quill = quillRef.current?.getEditor();
                  const range = quill?.getSelection();
                  if (range) {
                    quill?.format('link', url);
                  }
                }
              }}
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              title="Add Image"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const quill = quillRef.current?.getEditor();
                      const range = quill?.getSelection();
                      if (range && e.target?.result) {
                        quill?.insertEmbed(range.index, 'image', e.target.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
            >
              <Image className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute top-8 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>

        {/* Quill Editor */}
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="bg-white"
        />
      </div>
      
      <style jsx>{`
        .ql-editor {
          min-height: ${height} !important;
        }
      `}</style>

      {/* Click outside to close emoji picker */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};