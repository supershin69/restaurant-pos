"use client"

import { DataTableSkeleton } from "@/components/data-table-skeleton";
import useFoods from "./use-foods"
import { foodColumns } from "./columns";
import { DataTable } from "@/components/data-table";
import { CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

function FoodDashboard() {
    const { data, loading } = useFoods();

    if (loading) {
        return (
            <div className="container flex flex-col gap-2">
                <div className="flex justify-between items-center px-8">
                    <CardTitle>Foods</CardTitle>
                    <Button className="w-fit">
                        <Plus className="mr-1" />
                        Add
                    </Button>
                </div>
                <DataTableSkeleton columnCount={foodColumns.length} rowCount={5} />
            </div>
        )
    }
  return (
    <div className="container flex flex-col gap-2 px-8">

            <CardTitle>Foods</CardTitle>

        <DataTable 
            columns={foodColumns} 
            data={data} 
            searchKey="name" 
            searchPlaceholder="Filter foods..."  
            actions={
                <Button>
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                </Button>
            }
        />
    </div>
  )
}
export default FoodDashboard