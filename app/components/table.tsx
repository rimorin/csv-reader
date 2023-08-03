import React, { useEffect } from "react";
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Invoice } from "../interface";
import { functionDebouncer } from "../utils/helpers";
import { DEFAULT_PAGE_SIZES } from "../utils/constants";

const InvoiceTable = ({ url }: { url: string }) => {
  const [data, setData] = React.useState<Invoice[]>([]);
  const [pageCount, setPageCount] = React.useState<number>(-1);
  const [filter, setFilter] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string>("");

  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: DEFAULT_PAGE_SIZES[1],
    });

  const [isLoading, setIsLoading] = React.useState(false);

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const columns = React.useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        id: "Invoices",
        header: () => (
          <span className="p-5 text-lg font-semibold text-center text-gray-900 dark:text-white dark:bg-gray-800">
            Invoices from {url.split("/").pop()}
          </span>
        ),
        footer: (props) => props.column.id,
        columns: [
          {
            id: "InvoiceNo",
            accessorFn: (row) => row.InvoiceNo,
            cell: (info) => info.getValue(),
            header: () => <span>Invoice No</span>,
            footer: (props) => props.column.id,
          },
          {
            id: "StockCode",
            accessorFn: (row) => row.StockCode,
            cell: (info) => info.getValue(),
            header: () => <span>Stock Code</span>,
            footer: (props) => props.column.id,
          },
          {
            id: "Description",
            accessorFn: (row) => row.Description,
            cell: (info) => info.getValue(),
            header: () => <span>Description</span>,
            footer: (props) => props.column.id,
          },
          {
            id: "Quantity",
            accessorFn: (row) => row.Quantity,
            cell: (info) => info.getValue(),
            header: () => <span>Quantity</span>,
            footer: (props) => props.column.id,
          },
          {
            id: "InvoiceDate",
            accessorFn: (row) => row.InvoiceDate,
            cell: (info) => info.getValue(),
            header: () => <span>Invoice Dt</span>,
            footer: (props) => props.column.id,
          },
          {
            id: "UnitPrice",
            accessorFn: (row) => row.UnitPrice,
            cell: (info) => info.getValue(),
            header: () => <span>Unit Price</span>,
            footer: (props) => props.column.id,
          },
          {
            id: "CustomerID",
            accessorFn: (row) => row.CustomerID,
            cell: (info) => info.getValue(),
            header: () => <span>Customer ID</span>,
            footer: (props) => props.column.id,
          },
          {
            id: "Country",
            accessorFn: (row) => row.Country,
            cell: (info) => info.getValue(),
            header: () => <span>Country</span>,
            footer: (props) => props.column.id,
          },
        ],
      },
    ],
    []
  );

  const table = useReactTable({
    data: data,
    columns,
    pageCount: pageCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await fetch("api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: pageIndex,
          limit: pageSize,
          url: url,
          filter: filter,
        }),
      });
      const data = await response.json();

      setIsLoading(false);
      if (data.error) {
        setErrorMsg(data.error);
        return;
      }
      setData(data.results);
      setPageCount(data.pageCount);
    };
    fetchData();
  }, [pageIndex, pageSize, filter, url]);

  // if isloading, display spinner in center of screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-gray-900"></div>
        <h1 className="pt-4 text-2xl font-semibold text-center">Loading...</h1>
      </div>
    );
  }

  //   if isError , return error message
  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-semibold text-center">Error!</h1>
        <p className="text-center">{errorMsg}</p>
      </div>
    );
  }

  return (
    <>
      <table className="min-w-full border text-center text-sm font-light dark:border-neutral-500">
        <thead className="sticky top-0 border-b font-medium text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-2 py-4 text-center"
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id} className="border-b dark:border-neutral-500">
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id} className="whitespace-nowrap px-2 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <nav
        className={`flex items-center py-2 px-4 sticky bottom-0 bg-gray-200 dark:bg-gray-700 dark:text-gray-400 ${
          isLoading ? "justify-center" : "justify-between"
        }`}
        aria-label="Table navigation"
      >
        {isLoading ? (
          <div className="px-3 py-2 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200 h-8">
            loading...
          </div>
        ) : (
          <>
            <div className="inline-flex text-sm h-8">
              <span className="font-normal text-gray-500 dark:text-gray-400 m-auto">
                Page{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {table.getState().pagination.pageIndex + 1}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {table.getPageCount()}
                </span>
              </span>
            </div>
            <div className="inline-flex text-sm h-8">
              <div className="mb-3">
                <div className="relative mb-4 flex w-full items-stretch">
                  <span
                    className="input-group-text flex items-center whitespace-nowrap rounded px-3 py-1.5 text-center text-base font-normal text-neutral-700 dark:text-neutral-200"
                    id="basic-addon2"
                  >
                    Go To Page:
                  </span>
                  <input
                    type="number"
                    className="relative m-0 block min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                    placeholder="Search"
                    aria-label="Search"
                    aria-describedby="button-addon2"
                    defaultValue={table.getState().pagination.pageIndex + 1}
                    onChange={functionDebouncer((e: any) => {
                      const page = e.target.value
                        ? Number(e.target.value) - 1
                        : 0;
                      // if page index is more than count, set page index to last page
                      if (page > table.getPageCount() - 1) {
                        table.setPageIndex(table.getPageCount() - 1);
                        return;
                      }
                      table.setPageIndex(page);
                    }, 500)}
                  />
                </div>
              </div>
              <div className="mb-3">
                <div className="relative mb-4 flex w-full items-stretch">
                  <span
                    className="input-group-text flex items-center whitespace-nowrap rounded px-3 py-1.5 text-center text-base font-normal text-neutral-700 dark:text-neutral-200"
                    id="basic-addon2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                  <input
                    type="search"
                    className="relative m-0 block min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                    placeholder="Search"
                    aria-label="Search"
                    aria-describedby="button-addon2"
                    defaultValue={filter}
                    onChange={functionDebouncer((e: any) => {
                      setFilter(e.target.value);
                    }, 1000)}
                  />
                </div>
              </div>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mx-1"
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
              >
                {DEFAULT_PAGE_SIZES.map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
              <ul className="inline-flex -space-x-px mx-1">
                <li>
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    {"<<"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Previous
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Next
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    {">>"}
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </nav>
    </>
  );
};

export default InvoiceTable;
