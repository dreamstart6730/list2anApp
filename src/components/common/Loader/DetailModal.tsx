"use client";
import React from "react";
import { useState } from "react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
  onChangeFlag: (flag: boolean) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, children, onSave, onChangeFlag }) => {
  if (!isOpen) return null;
  const [changeFlag, setChangeFlag] = useState(false);
  const handleToggleChangeFlag = (flag: boolean) => {
    setChangeFlag(flag);
    onChangeFlag(flag); // Notify the parent
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
        {children}
        <div className="flex justify-end">
          {!changeFlag ? (<button
            onClick={() => handleToggleChangeFlag(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            変更
          </button>) : (
            <button
              onClick={() => {
                handleToggleChangeFlag(false);
                onSave();
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              保存
            </button>)}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
