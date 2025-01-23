"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "@/components/common/Loader";
import DetailModal from "@/components/common/Loader/DetailModal";
import { requestGroupCheckData, requestGroupCheckData2, requestGroupCheckData3, requestGroupCheckData4 } from "@/constant/RequestGroup";
import GroupCheckBox from "../NewRequest/GroupCheckBox/GroupCheckBox";
import { jwtDecode } from "jwt-decode";

interface RequestList {
    id: number;
    requestRandId: string;
    category: string;
    projectName: string;
    wishNum: number;
    tags: string[];
    portalSite: string[];
    detailCondition: Record<string, any>;
    completeState: number;
    areaSelection: Record<string, any>;
    areaMemo: string
    mainCondition: Record<string, any>;
    subCondition: Record<string, any>;
    listCount: number;
    fileName: string;
    filePath: string;
    createdAt: Date;
    updatedAt: Date;
    requestAt: Date;
    deliveryAt: Date;
    user: User;
}

interface User {
    id: number;
    name: string;
    email: string;
    contractId: string;
}

interface DecodedToken {
    id: string; // Adjust the type based on your token structure
    exp?: number; // Token expiry timestamp
    iat?: number;
    role: number;
}

interface RequestGroupCheckData {
    category: string;
    options: string[];
}

const ListDeliveryTable = () => {
    const [requestLists, setRequestLists] = useState<RequestList[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ project_name: "" });
    const [selectedList, setSelectedList] = useState<RequestList | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [usersWithoutContracts, setUsersWithoutContracts] = useState<User[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isCheckBoxModalOpen, setIsCheckBoxModalOpen] = useState(false);
    const [currentCondition, setCurrentCondition] = useState("");

    const transformData = (
        input: Record<string, string[]>,
        groupData: RequestGroupCheckData[],
        condition_string: string
    ): { checkedCategories: Record<string, boolean>; checkedItems: Record<string, Record<string, boolean>> } => {
        const checkedCategories: Record<string, boolean> = {};
        const checkedItems: Record<string, Record<string, boolean>> = {};

        groupData.forEach((group) => {
            const categoryKey = `${condition_string}-${group.category}`;
            const selectedOptions = input[group.category] || [];

            // Set checked status for categories
            checkedCategories[categoryKey] = selectedOptions.length > 0;

            // Set checked status for individual options
            checkedItems[categoryKey] = group.options.reduce((acc, option) => {
                acc[option] = selectedOptions.includes(option);
                return acc;
            }, {} as Record<string, boolean>);
        });

        return { checkedCategories, checkedItems };
    };

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem("listan_token");
            if (!token) {
                console.log("No token found. Redirecting to login...");
                return;
            }

            const decodedToken = jwtDecode<DecodedToken>(token);
            const userId = decodedToken?.id;

            if (!userId) {
                console.log("Invalid token: userId not found.");
                // Handle token validation failure
                return;
            }
            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/requestLists_mana`,
                    {
                        params: { userId },
                        headers: { Authorization: `Bearer ${token}` }, // Optional: Pass token in the header
                    }
                );
                const requests = response.data.requests.map((request: RequestList) => ({ ...request, category: 'グリーン' }));
                const requestsBlue = response.data.requestsBlue.map((request: RequestList) => ({ ...request, category: 'ブルー' }));
                const requestsPink = response.data.requestsPink.map((request: RequestList) => ({ ...request, category: 'ピンク' }));
                const requestsYellow = response.data.requestsYellow.map((request: RequestList) => ({ ...request, category: 'イエロー' }));

                const combinedRequests = [
                    ...requests,
                    ...requestsBlue,
                    ...requestsPink,
                    ...requestsYellow
                ];

                setRequestLists(combinedRequests);
                console.log("Fetched requests:", response.data.requests);

            } catch (error) {
                console.log("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleFileSelection = (files: FileList | null) => {
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert("ファイルを選択してください。");
            return;
        }

        if (!selectedList) {
            alert("リストが選択されていません。");
            return;
        }
        let categoryMark = "";
        switch (selectedList.category) {
            case 'ピンク':
                categoryMark = "Pink";
                break;
            case 'ブルー':
                categoryMark = "Blue";
                break;
            case 'グリーン':
                categoryMark = "Green";
                break;
            case 'イエロー':
                categoryMark = "Yellow";
                break;
            default:
                categoryMark = "Unknown";
                break;
        }
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("requestId", selectedList.id.toString());
        formData.append('category', categoryMark)

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-csv-file`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const updatedRequest = response.data.updatedRequest;
            updatedRequest.category = selectedList.category;
            // Update the selected list and request lists
            setSelectedList((prev) => (prev && (prev.id === updatedRequest.id && prev.category === updatedRequest.category) ? updatedRequest : prev));
            setRequestLists((prevRequests) =>
                prevRequests.map((request) =>
                    (request.id === updatedRequest.id && request.category === updatedRequest.category) ? updatedRequest : request
                )
            );
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("ファイルのアップロードに失敗しました。");
        }
    };


    const handleChangeFlag = (flag: boolean) => {
        setIsReadOnly(!flag); // Update read-only based on flag
    };

    const handleSaveSelectedList = async () => {
        if (!selectedList) return; // Ensure there's a selected list to save

        try {
            const token = localStorage.getItem("listan_token");
            if (!token) {
                console.log("No token found. Cannot update request.");
                return;
            }

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/update_request/${selectedList.id}`,
                selectedList,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include token for authentication
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                console.log("Request updated successfully:", response.data);
                alert("リクエストが正常に更新されました。!");

                // Optionally refresh the request list after update
                setRequestLists((prevRequests) =>
                    prevRequests.map((request) =>
                        request.id === selectedList.id ? response.data : request
                    )
                );

                // Close the detail modal
                setIsDetailModalOpen(false);
            } else {
                console.error("Failed to update request:", response.statusText);
                alert("リクエストの更新に失敗しました。");
            }
        } catch (error) {
            console.error("Error updating request:", error);
            alert("リクエストの更新中にエラーが発生しました。");
        }
    };

    const openDetailModal = (requestList: RequestList) => {
        setSelectedList(requestList);
        setIsDetailModalOpen(true);
    };

    const handleDownloadList = async () => {
        if (!selectedList || !selectedList.filePath) {
            alert("ダウンロード可能なファイルが見つかりません。");
            return;
        }

        try {
            // Fetch the file as a blob from the server
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${selectedList.filePath}`, {
                responseType: 'blob',
            });

            // Create a Blob URL for the file
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Create a temporary link element for downloading
            const link = document.createElement('a');
            link.href = url;
            const now = new Date();
            const formattedDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
            const fileName = `${selectedList.projectName || 'MyProject'}_${formattedDate}.csv`;
            link.setAttribute('download', fileName);
            // Trigger the download
            document.body.appendChild(link);
            link.click();

            // Clean up the temporary link
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url); // Release the Blob URL
        } catch (error) {
            console.error("Error downloading the file:", error);
            alert("ファイルのダウンロード中にエラーが発生しました。");
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="rounded-sm border border-gray-500 mx-4 px-6 pb-2.5 pt-6 shadow-default bg-white sm:px-8 xl:pb-1">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left">
                                <th className="min-w-[40px] px-4 py-4 font-medium text-black">No</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-black">クライアント名</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-black">依頼ID</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-black">プロジェクト名</th>
                                <th className="min-w-[120px] px-4 py-4 font-medium text-black">リスト数</th>
                                <th className="px-4 py-4 font-medium text-black">リスト区分</th>
                                <th className="px-4 py-4 font-medium text-black">状況</th>
                                <th className="px-4 py-4 font-medium text-black">更新日</th>
                                <th className="px-4 py-4 font-medium text-black"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {requestLists.map((requestList, index) => (
                                <tr key={requestList.id + requestList.category}>
                                    <td className="border-b px-4 py-5 text-black">{index + 1}</td>
                                    <td className="border-b px-4 py-5 text-black">{requestList.user.name}</td>
                                    <td className="border-b px-4 py-5 text-black">{requestList.requestRandId}</td>
                                    <td className="border-b px-4 py-5 text-black">{requestList.projectName}</td>
                                    <td className="border-b px-4 py-5 text-black">{requestList.listCount}</td>
                                    <td className="border-b px-4 py-5 text-black">{requestList.category}</td>
                                    <td className="border-b px-4 py-5 text-black">{(requestList.completeState > 0) ? ((requestList.completeState < 2) ? "依頼完了" : "納品済み") : ("下書き")}</td>
                                    <td className="border-b px-4 py-5 text-black">
                                        {requestList.createdAt
                                            ? new Intl.DateTimeFormat("ja-JP", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }).format(new Date(requestList.createdAt))
                                            : "N/A"}
                                    </td>
                                    <td className="border-b px-4 py-5 text-white">
                                        <button
                                            className="text-blue-500 hover:underline"
                                            onClick={() => openDetailModal(requestList)}
                                        >
                                            詳細
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedList && (
                <DetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    onSave={handleSaveSelectedList}
                    onChangeFlag={handleChangeFlag}
                    onDelete={() => { }}
                    onDownloadList={handleDownloadList}
                    deleteFlag={false}
                    downloadFlag={selectedList.completeState > 1}
                >
                    <h2 className="text-lg font-bold mb-4 text-gray-700">リスト詳細</h2>
                    <div>
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">クライアント名</label>
                            <input
                                type="text"
                                value={selectedList.user.name}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">依頼ID</label>
                            <input
                                type="text"
                                value={selectedList.requestRandId}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">プロジェクト名</label>
                            <input
                                type="text"
                                value={selectedList.projectName}
                                onChange={(e) => {
                                    setSelectedList((prev) => ({
                                        ...prev, projectName: e.target.value
                                    } as RequestList))
                                }}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly={isReadOnly}
                            />
                        </div>
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">希望件数</label>
                            <input
                                type="text"
                                value={selectedList.wishNum}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly={isReadOnly}
                            />
                        </div>
                        {(selectedList.category == 'グリーン') && (
                            <div className="flex py-2">
                                <label htmlFor="main_condition_confirm" className="min-w-40 block mb-2 text-base font-medium text-gray-700">業種の絞り込み</label>
                                <button
                                    onClick={() => {
                                        setIsCheckBoxModalOpen(true)
                                        setCurrentCondition("main_condition")
                                    }}
                                    className="bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600"
                                >
                                    データを表示
                                </button>
                                <GroupCheckBox
                                    isOpen={isCheckBoxModalOpen}
                                    onClose={() => setIsCheckBoxModalOpen(false)}
                                    dataset={{ name: "main_condition", data: requestGroupCheckData }}
                                    current_condition={currentCondition}
                                    checkedCategories={transformData(selectedList.mainCondition, requestGroupCheckData, "main_condition").checkedCategories}
                                    checkedItems={transformData(selectedList.mainCondition, requestGroupCheckData, "main_condition").checkedItems}
                                />
                            </div>
                        )}
                        {(selectedList.category == 'ブルー') && (
                            <div className="flex py-2">
                                <label htmlFor="detail_condition_confirm" className="min-w-40 block mb-2 text-base font-medium text-gray-700">条件の絞り込み</label>
                                <button
                                    onClick={() => {
                                        setIsCheckBoxModalOpen(true)
                                        setCurrentCondition("detail_condition")
                                    }}
                                    className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    データを表示
                                </button>
                                <GroupCheckBox
                                    isOpen={isCheckBoxModalOpen}
                                    onClose={() => setIsCheckBoxModalOpen(false)}
                                    dataset={{ name: "detail_condition", data: requestGroupCheckData4 }}
                                    current_condition={currentCondition}
                                    checkedCategories={transformData(selectedList.detailCondition, requestGroupCheckData4, "detail_condition").checkedCategories}
                                    checkedItems={transformData(selectedList.detailCondition, requestGroupCheckData4, "detail_condition").checkedItems}
                                />
                            </div>
                        )}
                        {(selectedList.category == 'グリーン') && (
                            <div className="flex py-2">
                                <label htmlFor="sub_condition_confirm" className="min-w-40 block mb-2 text-base font-medium text-gray-700">その他条件の絞り込み</label>
                                <button
                                    onClick={() => {
                                        setIsCheckBoxModalOpen(true)
                                        setCurrentCondition("sub_condition")
                                    }}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    データを表示
                                </button>
                                <GroupCheckBox
                                    isOpen={isCheckBoxModalOpen}
                                    onClose={() => setIsCheckBoxModalOpen(false)}
                                    dataset={{ name: "sub_condition", data: requestGroupCheckData2 }}
                                    current_condition={currentCondition}
                                    checkedCategories={transformData(selectedList.subCondition, requestGroupCheckData2, "sub_condition").checkedCategories}
                                    checkedItems={transformData(selectedList.subCondition, requestGroupCheckData2, "sub_condition").checkedItems}
                                />
                            </div>
                        )}
                        <div className="flex pb-2">
                            <label className="block text-gray-700 min-w-40">エリアの絞り込み</label>
                            <button
                                onClick={() => {
                                    setIsCheckBoxModalOpen(true)
                                    setCurrentCondition("area_condition")
                                }}
                                className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600"

                            >
                                データを表示
                            </button>
                            <GroupCheckBox
                                isOpen={isCheckBoxModalOpen}
                                onClose={() => setIsCheckBoxModalOpen(false)}
                                dataset={{ name: "area_condition", data: requestGroupCheckData3 }}
                                current_condition={currentCondition}
                                checkedCategories={transformData(selectedList.areaSelection, requestGroupCheckData3, "area_condition").checkedCategories}
                                checkedItems={transformData(selectedList.areaSelection, requestGroupCheckData3, "area_condition").checkedItems}
                            />
                        </div>
                        {(selectedList.category == 'ブルー') && (
                            <div className="flex">
                                <label className="block text-gray-700 min-w-40">タグ番号</label>
                                <input
                                    type="text"
                                    value={selectedList.tags.toString()}
                                    onChange={(e) => {
                                        setSelectedList((prev) => ({
                                            ...prev, projectName: e.target.value
                                        } as RequestList))
                                    }}
                                    className={`w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500`}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        )}
                        {(selectedList.category == 'イエロー') && (
                            <div className="flex">
                                <label className="block text-gray-700 min-w-40">ポータルサイト</label>
                                <input
                                    type="text"
                                    value={selectedList.portalSite}
                                    onChange={(e) => {
                                        setSelectedList((prev) => ({
                                            ...prev, projectName: e.target.value
                                        } as RequestList))
                                    }}
                                    className={`w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500`}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        )}
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">{(selectedList.category == 'ピンク') ? '市区' : 'その他備考'}</label>
                            <textarea
                                value={selectedList.areaMemo}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500 min-h-24"
                                readOnly={isReadOnly}
                                onChange={(e) => {
                                    setSelectedList((prev) => ({
                                        ...prev, areaMemo: e.target.value
                                    } as RequestList))
                                }}
                            />
                        </div>
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">リスト数</label>
                            <input
                                type="number"
                                value={selectedList.listCount}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">状況</label>
                            <input
                                type="text"
                                value={(selectedList.completeState > 0) ? ((selectedList.completeState < 2) ? "依頼完了" : "納品済み") : ("下書き")}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">リスト区分</label>
                            <input
                                type="text"
                                value={selectedList.category}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">依頼日</label>
                            <input
                                type="text"
                                value={selectedList.createdAt
                                    ? new Intl.DateTimeFormat("ja-JP", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }).format(new Date(selectedList.createdAt))
                                    : "N/A"}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">更新日</label>
                            <input
                                type="text"
                                value={selectedList.createdAt
                                    ? new Intl.DateTimeFormat("ja-JP", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }).format(new Date(selectedList.updatedAt))
                                    : "N/A"}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div className="flex">
                            <label className="block text-gray-700 min-w-40">ファイル名</label>
                            <input
                                type="text"
                                value={selectedList.fileName}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="space-y-4 flex justify-between">
                        <div className="flex flex-col">
                            <label className="block text-gray-700 text-sm">CSV アップロード</label>
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                accept=".csv"
                                id="fileInput"
                                className="hidden"
                                onChange={(e) => handleFileSelection(e.target.files)}
                            />
                            {/* Custom Button to Trigger File Dialog */}
                            <button
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                onClick={() => document.getElementById("fileInput")?.click()}
                            >
                                {selectedFile ? selectedFile.name : "ファイルを選択"}
                            </button>
                        </div>
                        <button
                            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                            onClick={handleFileUpload}
                        >
                            納品
                        </button>
                    </div>
                </DetailModal>
            )}
        </>
    );
};

export default ListDeliveryTable;
