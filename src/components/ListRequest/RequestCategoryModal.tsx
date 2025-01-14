import React from "react";
import Link from "next/link";

interface RequestCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RequestCategoryModal: React.FC<RequestCategoryModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    console.log(isOpen);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    ✖
                </button>
                <div className="my-4 mt-4">
                    <p className="text-lg pt-2 pb-4 pl-4">
                        依頼したいリストを選択してください。
                    </p>
                    <div className="flex justify-between ">
                        <Link href={`/new_request_blue`}>
                            <button type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
                                ブルー</button>
                        </Link>
                        <Link href={`/new_request`}>
                            <button type="button"
                                className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
                                グリーン</button>
                        </Link>
                        <Link href={`#`}>
                            <button type="button"
                                className="focus:outline-none text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
                                イエロー</button>
                        </Link>
                        <Link href={`#`}>
                            <button type="button"
                                className="focus:outline-none text-white bg-pink-700 hover:bg-pink-800 focus:ring-4 focus:ring-pink-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2">
                                ピンク</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default RequestCategoryModal;