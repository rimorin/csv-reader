import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Invoice } from "../interface";
import { functionDebouncer } from "../utils/helpers";
import { DEBOUNCE_DELAY_MS, DEFAULT_PAGE_SIZES } from "../utils/constants";
import {
  Table,
  Navbar,
  Pagination,
  Select,
  TextInput,
  Spinner,
} from "flowbite-react";
import { BsSearch, BsFillSkipForwardFill } from "react-icons/bs";

const InvoiceTable = ({ url }: { url: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Invoice[]>([]);
  const [pageCount, setPageCount] = useState<number>(-1);
  const [filter, setFilter] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZES[2],
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        id: "Invoices",
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
        <Spinner size="xl" />
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
      <div className="overflow-x-auto h-[80vh]">
        <Table striped hoverable>
          <Table.Head style={{ position: "sticky", top: 0 }}>
            {table.getHeaderGroups()[1].headers.map((header) => (
              <Table.HeadCell
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
              </Table.HeadCell>
            ))}
          </Table.Head>
          <Table.Body>
            {table.getRowModel().rows.map((row) => {
              return (
                <Table.Row
                  key={row.id}
                  className="border-b dark:border-neutral-500"
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <Table.Cell
                        key={cell.id}
                        className="whitespace-nowrap px-2 py-4"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
      <Navbar fluid rounded>
        <Navbar.Brand>
          <span className="font-normal text-gray-500 dark:text-gray-400 m-auto">
            Page{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {table.getState().pagination.pageIndex}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {table.getPageCount()}
            </span>
          </span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <TextInput
            icon={BsFillSkipForwardFill}
            className="mt-1 w-40"
            placeholder="Go to Page"
            type="number"
            min={1}
            max={table.getPageCount()}
            onChange={functionDebouncer((e: any) => {
              const page = Number(e.target.value);

              if (page < 1) {
                table.setPageIndex(1);
                return;
              }

              if (page > table.getPageCount()) {
                table.setPageIndex(table.getPageCount());
                return;
              }
              table.setPageIndex(page);
            }, DEBOUNCE_DELAY_MS)}
          />
          <TextInput
            icon={BsSearch}
            className="mt-1"
            placeholder="Search Data"
            type="text"
            defaultValue={filter}
            onChange={functionDebouncer((e: any) => {
              setFilter(e.target.value);
            }, DEBOUNCE_DELAY_MS)}
          />
          <Select
            className="mt-1"
            value={table.getState().pagination.pageSize}
            onChange={(e) =>
              table.setPagination((old) => ({
                ...old,
                pageIndex: 1,
                pageSize: Number(e.target.value),
              }))
            }
          >
            {DEFAULT_PAGE_SIZES.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </Select>
          <Pagination
            currentPage={table.getState().pagination.pageIndex}
            onPageChange={(page) => {
              table.setPageIndex(page);
            }}
            showIcons
            totalPages={table.getPageCount()}
          />
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

export default InvoiceTable;
