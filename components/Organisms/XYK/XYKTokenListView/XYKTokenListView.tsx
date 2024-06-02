import { type Option, None, Some } from "@/utils/option";
import { type TokenV2Volume, prettifyCurrency } from "@covalenthq/client-sdk";
import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TokenAvatar } from "../../../Atoms";
import { Button } from "@/components/ui/button";
import { TableHeaderSorting } from "@/components/ui/tableHeaderSorting";
import { BalancePriceDelta, IconWrapper } from "@/components/Shared";
import { GRK_SIZES } from "@/utils/constants/shared.constants";
import { useGoldRush } from "@/utils/store";
import { type XYKTokenListViewProps } from "@/utils/types/organisms.types";
import { SkeletonTable } from "@/components/ui/skeletonTable";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import { GoodsDatas } from '@/graphql/data.processing';
import { prettifyCurrencys } from '@/graphql/data.processing.util';

export const XYKTokenListView: React.FC<XYKTokenListViewProps> = ({
    chain_name,
    dex_name,
    on_token_click,
    page_size = 10,
}) => {
    const { covalentClient } = useGoldRush();

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "total_volume_24h_quote",
            desc: true,
        },
    ]);
    const [rowSelection, setRowSelection] = useState({});
    const [maybeResult, setResult] = useState<Option<TokenV2Volume[]>>(None);
    const [error, setError] = useState({ error: false, error_message: "" });
    const [windowWidth, setWindowWidth] = useState<number>(0);
    const [pagination, setPagination] = useState({
        page_number: 1,
    });
    const [hasMore, setHasMore] = useState<boolean>();

    const handlePagination = (page_number: number) => {
        setPagination((prev) => {
            return {
                ...prev,
                page_number,
            };
        });
    };

    useEffect(() => {
        (async () => {
            setResult(None);
            let response;
            try {
                
                response =
                    // await covalentClient.XykService.getNetworkExchangeTokens(
                    //     chain_name,
                    //     dex_name,
                    //     // @ts-ignore
                    //     {
                    //         pageNumber: pagination.page_number - 1,
                    //         pageSize: page_size,
                    //     }
                    // );
                    await GoodsDatas();
                    // console.log(response,"***");
                setHasMore(response.pagination.has_more);
                setError({ error: false, error_message: "" });
                setResult(new Some(response.items));
            } catch (exception) {
                setResult(new Some([]));
                setError({
                    error: response ? response.error : false,
                    error_message: response ? response.error_message : "",
                });
            }
        })();
    }, [chain_name, dex_name, pagination]);

    useEffect(() => {
        setWindowWidth(window.innerWidth);

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const columns: ColumnDef<TokenV2Volume>[] = [
        {
            id: "name",
            accessorKey: "name",
            header: ({ column }) => (
                <div className="ml-4">
                    <TableHeaderSorting
                        align="left"
                        header_name={"Goods"}
                        column={column}
                    />
                </div>
            ),
            cell: ({ row }) => {
                // console.log(row,"((((")
                return (
                    <div className="ml-4 flex items-center gap-3">
                        <TokenAvatar
                            size={GRK_SIZES.EXTRA_SMALL}
                            token_url={row.original.logo_url}
                        />
                        <div className="flex flex-col">
                            {on_token_click ? (
                                <a
                                    className="cursor-pointer hover:opacity-75"
                                    onClick={() => {
                                        if (on_token_click) {
                                            on_token_click(
                                                row.original.id
                                            );
                                        }
                                    }}
                                >
                                    {row.original.name
                                        ? row.original.name
                                        : ""}
                                </a>
                            ) : (
                                <label className="text-base">
                                    {row.original.name
                                        ? row.original.name
                                        : ""}
                                </label>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            id: "symbol",
            accessorKey: "symbol",
            header: ({ column }) => (
                <TableHeaderSorting
                    align="right"
                    header_name={"Symbol"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                return (
                    <div className="text-right">
                        {row.original.symbol}
                    </div>
                );
            },
        },
        {
            id: "totalTradeQuantity",
            accessorKey: "totalTradeQuantity",
            header: ({ column }) => (
                <TableHeaderSorting
                    align="right"
                    header_name={"Total Volume"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const valueFormatted = prettifyCurrencys(
                    row.original.totalTradeQuantity
                );

                return <div className="text-right">{valueFormatted}</div>;
            },
        },
        {
            id: "totalTradeValue",
            accessorKey: "totalTradeValue",
            header: ({ column }) => (
                // console.log(column,"&&&");
                <TableHeaderSorting
                    align="right"
                    header_name={"Total Amount"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const valueFormatted = prettifyCurrencys(
                    row.original.totalTradeValue
                );

                return <div className="text-right">{valueFormatted}</div>;
            },
        },
        {
            id: "tradeQuantity24",
            accessorKey: "tradeQuantity24",
            header: ({ column }) => (
                <TableHeaderSorting
                    align="right"
                    header_name={"Volume(24h)"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const valueFormatted = prettifyCurrencys(
                    row.original.tradeQuantity24
                );

                return <div className="text-right">{valueFormatted}</div>;
            },
        },
        {
            id: "tradeValue24",
            accessorKey: "tradeValue24",
            header: ({ column }) => (
                <TableHeaderSorting
                    align="right"
                    header_name={"Amount(24h)"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const valueFormatted = prettifyCurrencys(
                    row.original.tradeValue24
                );

                return <div className="text-right">{valueFormatted}</div>;
            },
        },
        {
            id: "totalFee",
            accessorKey: "totalFee",
            header: ({ column }) => (
                <TableHeaderSorting
                    align="right"
                    header_name={"Fee"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const valueFormatted = prettifyCurrencys(
                    row.original.totalFee
                );

                return <div className="text-right">{valueFormatted}</div>;
            },
        },
        {
            id: "totalFeeValue",
            accessorKey: "totalFeeValue",
            header: ({ column }) => (
                <TableHeaderSorting
                    align="right"
                    header_name={"Fee Amount"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const valueFormatted = prettifyCurrencys(
                    row.original.totalFeeValue
                );

                return <div className="text-right">{valueFormatted}</div>;
            },
        },
        {
            id: "price_24h",
            accessorKey: "price_24h",
            header: ({ column }) => (
                <TableHeaderSorting
                    align="right"
                    header_name={"Price Change (24h)"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                return (
                    <div className="text-right">
                        <BalancePriceDelta
                            // @ts-ignore
                            numerator={row.original.price_24h}
                            denominator={row.original.price}
                        />{" "}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="ml-auto  ">
                                    <span className="sr-only">Open menu</span>
                                    <IconWrapper icon_class_name="expand_more" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (on_token_click) {
                                            on_token_click(
                                                row.original.id
                                            );
                                        }
                                    }}
                                >
                                    <IconWrapper
                                        icon_class_name="swap_horiz"
                                        class_name="mr-2"
                                    />{" "}
                                    View Token
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const mobile_columns: ColumnDef<TokenV2Volume>[] = [
        {
            id: "name",
            accessorKey: "name",
            header: ({ column }) => (
                <TableHeaderSorting
                    align="left"
                    header_name={"Token"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-3">
                        <TokenAvatar
                            size={GRK_SIZES.EXTRA_SMALL}
                            token_url={row.original.logo_url}
                        />
                        <div className="flex flex-col">
                            {on_token_click ? (
                                <a
                                    className="cursor-pointer hover:opacity-75"
                                    onClick={() => {
                                        if (on_token_click) {
                                            on_token_click(
                                                row.original.id
                                            );
                                        }
                                    }}
                                >
                                    {row.original.name
                                        ? row.original.name
                                        : ""}
                                </a>
                            ) : (
                                <label className="text-base">
                                    {row.original.name
                                        ? row.original.name
                                        : ""}
                                </label>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            id: "totalTradeQuantity",
            accessorKey: "totalTradeQuantity",
            header: ({ column }) => (
                <TableHeaderSorting
                    align="right"
                    header_name={"Volume"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const valueFormatted = prettifyCurrencys(
                    row.original.totalTradeQuantity
                );

                return <div className="text-right">{valueFormatted}</div>;
            },
        },
        {
            id: "tradeQuantity24",
            accessorKey: "tradeQuantity24",
            header: ({ column }) => (
                <TableHeaderSorting
                    align="right"
                    header_name={"Volume (24h)"}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                const valueFormatted = prettifyCurrencys(
                    row.original.tradeQuantity24
                );

                return <div className="text-right">{valueFormatted}</div>;
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="ml-auto  ">
                                    <span className="sr-only">Open menu</span>
                                    <IconWrapper icon_class_name="expand_more" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (on_token_click) {
                                            on_token_click(
                                                row.original.id
                                            );
                                        }
                                    }}
                                >
                                    <IconWrapper
                                        icon_class_name="swap_horiz"
                                        class_name="mr-2"
                                    />{" "}
                                    View Token
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: maybeResult.match({
            None: () => [],
            Some: (result) => result,
        }),
        columns: windowWidth < 700 ? mobile_columns : columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rowSelection,
        },
    });

    const body = maybeResult.match({
        None: () => <SkeletonTable cols={5} float="right" />,
        Some: () =>
            error.error ? (
                <TableRow>
                    <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                    >
                        {error.error_message}
                    </TableCell>
                </TableRow>
            ) : !error.error && table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                    >
                        No results.
                    </TableCell>
                </TableRow>
            ),
    });

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>{body}</TableBody>
            </Table>
            <Pagination className="select-none">
                <PaginationContent>
                    <PaginationItem
                        disabled={pagination.page_number === 1}
                        onClick={() => {
                            handlePagination(pagination.page_number - 1);
                        }}
                    >
                        <PaginationPrevious />
                    </PaginationItem>
                    {pagination.page_number > 1 && (
                        <PaginationItem
                            onClick={() => {
                                handlePagination(pagination.page_number - 1);
                            }}
                        >
                            <PaginationLink>
                                {pagination.page_number - 1}
                            </PaginationLink>
                        </PaginationItem>
                    )}
                    <PaginationItem>
                        <PaginationLink isActive>
                            {pagination.page_number}
                        </PaginationLink>
                    </PaginationItem>
                    {hasMore && (
                        <PaginationItem
                            onClick={() => {
                                handlePagination(pagination.page_number + 1);
                            }}
                        >
                            <PaginationLink>
                                {pagination.page_number + 1}
                            </PaginationLink>
                        </PaginationItem>
                    )}
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem
                        disabled={!hasMore}
                        onClick={() => {
                            handlePagination(pagination.page_number + 1);
                        }}
                    >
                        <PaginationNext />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};
