"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "@/app/lib/data-table-features"

import { ArrowUpDown } from "lucide-react"

import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"


export type Food = {
    id: string
    name: string
    description?: string
    price: number
    photoUrl?: string
    createdAt: Date | string
    updatedAt: Date | string
}

const columnHelper = createColumnHelper<DataTableFeatures, Food>()

export const foodColumns = columnHelper.columns([
    columnHelper.display({
        id: "select",
        header: ({ table }) => (
        <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={
            table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
        />
        ),
        cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
        />
        ),
        enableSorting: false,
        enableHiding: false,
    }),
    columnHelper.accessor("id", {
        header: "ID"
    }),
    columnHelper.accessor("name", {      
        header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        
    }),
    columnHelper.accessor("description", {
        header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Description
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: (info) => {
            const description = info.getValue()

            if (!description?.trim()) {
                return (
                    <div className="text-xs text-center italic text-muted-foreground">
                        No description
                    </div >
                )
            }

            return (
                <div 
                    className="max-w-62.5 truncate text-sm text-muted-foreground"
                    title={description}
                >
                    {description}
                </div>
            )
        },
    }),
    columnHelper.accessor("price", {
        sortFn: "alphanumeric",
        header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: (info) => {
            const formatted = new Intl.NumberFormat("en-US").format(info.getValue())
            return `${formatted} MMK`
        },
    }),
    columnHelper.accessor("photoUrl", {
        header: "Photo",
        cell: (info) => {
            const photoUrl = info.getValue()

            if (!photoUrl) {
            return (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-[10px] text-muted-foreground border">
                No img
                </div>
            )
            }

            return (
            <Image
                width={40}
                height={40}
                src={photoUrl}
                alt="Food"
                className="h-10 w-10 rounded-md object-cover border"
            />
            )
        },
    }),
    columnHelper.accessor("createdAt", {
        sortFn: "text", // ISO date strings ("2026-08-09...") sort chronologically with standard text sort
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Created At
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: (info) => {
            const dateVal = info.getValue()
            if (!dateVal) return "-"
            return new Date(dateVal).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })
        },
    }),
    columnHelper.accessor("updatedAt", {
        sortFn: "text",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Updated At
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: (info) => {
            const dateVal = info.getValue()
            if (!dateVal) return "-"
            return new Date(dateVal).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })
        },
    }),
    columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
            const food = row.original

            return (

                <DropdownMenu>
                    <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    } />
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            {/*<DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    })
])