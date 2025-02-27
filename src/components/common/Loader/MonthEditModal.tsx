import React, { Dispatch, SetStateAction } from 'react';

interface MonthEditModalProps {
    onClose: () => void;
    monthTarget: Date;
    setMonthTarget: Dispatch<SetStateAction<Date>>;
    getMonthData: (date: Date) => Promise<void>;
}

const MonthEditModal: React.FC<MonthEditModalProps> = ({ onClose, monthTarget, setMonthTarget, getMonthData }) => {
    const handleDateChange = (dateStr: string) => {
        setMonthTarget(new Date(dateStr));
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
            <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
                <div className="max-w-full overflow-x-auto">
                    <div className="flex items-center mb-4 justify-center">
                        <button 
                            onClick={() => {
                                const newDate = new Date(monthTarget);
                                newDate.setMonth(monthTarget.getMonth() - 1);
                                setMonthTarget(newDate);
                            }}
                            className="text-gray-600 hover:text-gray-800 px-4"
                        >
                            ←
                        </button>
                        <div className="flex items-center relative">
                            <input 
                                type="month" 
                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                value={monthTarget.toISOString().slice(0, 7)}
                                onChange={(e) => handleDateChange(e.target.value)}
                                id="monthPicker"
                                aria-label="Month picker"
                            />
                            <div 
                                className="mx-4 bg-teal-600 text-white px-4 py-1 rounded cursor-pointer"
                                onClick={() => {
                                    console.log(document.getElementById('monthPicker'));
                                    (document.getElementById('monthPicker') as HTMLInputElement)?.showPicker();
                                }}
                            >
                                {`${monthTarget.getFullYear()}年${monthTarget.getMonth() + 1}月`}
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                const newDate = new Date(monthTarget);
                                newDate.setMonth(monthTarget.getMonth() + 1);
                                setMonthTarget(newDate);
                            }}
                            className="text-gray-600 hover:text-gray-800 px-4"
                        >
                            →
                        </button>
                    </div>
                    <table className="w-full table-auto">
                        <thead>
                            <tr>
                                <th className="min-w-[120px] px-4 py-2 font-medium text-black"></th>
                                <th className="px-4 py-2 font-medium text-black">リルト数</th>
                                <th className="px-4 py-2 font-medium text-black">依頼数</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="bg-red-500 text-white px-4 py-2 rounded">レッド</div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    -
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsRed?.length || 0} */}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="bg-blue-500 text-white px-4 py-2 rounded">ブルー</div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsBlue?.reduce((sum, item) => sum + item.listCount, 0) || 0} */}
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsBlue?.length || 0} */}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="bg-green-500 text-white px-4 py-2 rounded">グリーン</div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsGreen?.reduce((sum, item) => sum + item.listCount, 0) || 0} */}
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsGreen?.length || 0} */}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="bg-yellow-400 text-white px-4 py-2 rounded">イエロー</div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsYellow?.reduce((sum, item) => sum + item.listCount, 0) || 0} */}
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsYellow?.length || 0} */}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="bg-pink-500 text-white px-4 py-2 rounded">ピンク</div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsPink?.reduce((sum, item) => sum + item.listCount, 0) || 0} */}
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {selectedClient?.user?.requestsPink?.length || 0} */}
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    <div className="px-4 py-2 rounded">合計
                                    </div>
                                </td>
                                <td></td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {countSum} */}
                                </td>
                                <td className="border-b border-[#eee] px-4 py-2 text-center">
                                    {/* {count_request} */}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default MonthEditModal;