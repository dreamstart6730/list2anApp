import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import RedListDeliveryTable from "@/components/ListDelivery/RedListDelivery";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const metadata: Metadata = {
    title:
        "ListAn Dashboard",
    description: "This is a management system or Company Users",
};

export default function Home() {
    return (
        <>
            <DefaultLayout>
                <Breadcrumb pageName="レッドリスト納品" />
                <RedListDeliveryTable />
            </DefaultLayout>
        </>
    );
}
