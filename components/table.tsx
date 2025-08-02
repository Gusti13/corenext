"use client";
import { useQueryHelpers } from "@/hooks/use-query-helpers";
import { ArrowDown, ArrowUp, Loader2, Minus } from "lucide-react";
import React from "react";

export const IconSort = ({ value }: { value: string }) => {
  const { getQueryParams } = useQueryHelpers();
  const params = getQueryParams();
  const sort = params.get("sort");
  const column = params.get("column");

  if (column == value && sort == "asc") {
    return <ArrowUp className="w-4" />;
  } else if (column == value && sort == "desc") {
    return <ArrowDown className="w-4" />;
  } else {
    return <Minus className="w-4" />;
  }
};

interface TableHeadProps {
  label: React.ReactNode;
  keys: string;
}

export const TableHead = (props: TableHeadProps) => {
  const { getQueryParams, setMultipleQueryParams } = useQueryHelpers();

  const handleSort = (value: string) => {
    const params = getQueryParams();
    const sort = params.get("sort");

    const newSort = sort === "asc" ? "desc" : "asc";

    setMultipleQueryParams({
      column: value,
      sort: newSort,
    });
  };

  return (
    <th
      className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] relative whitespace-nowrap bg-background border-b border-r last:border-r-0 hover:bg-muted/30"
      colSpan={1}
      style={{ width: 200 }}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => handleSort(props.keys)}
      >
        {props.label}
        <IconSort value={props.keys} />
      </div>
    </th>
  );
};

interface TableRowProps {
  children: React.ReactNode;
}
export const TableRow = ({ children }: TableRowProps) => {
  return (
    <td
      className="align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] p-4 overflow-hidden overflow-ellipsis"
      style={{ width: 200 }}
    >
      {children}
    </td>
  );
};

interface IColumn<T> {
  label: React.ReactNode;
  key: keyof T;
  render?: (obj: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: IColumn<T>[];
  datas: T[];
  isLoading?: boolean;
}

export function Table<T>(props: TableProps<T>) {
  const isEmpty = !props?.datas || props.datas.length === 0;

  return (
    <div className="rounded-md border bg-card text-card-foreground py-1 px-1">
      <div className="relative w-full max-h-[60vh] overflow-auto">
        <table className="w-full caption-bottom text-sm xl:table-fixed border-separate border-spacing-0">
          <thead className="[&_tr]:border-b sticky top-0">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {props.columns?.map((item, i) => (
                <TableHead
                  key={i}
                  keys={item.key as string}
                  label={item.label}
                />
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {props.isLoading ? (
              <TableLoader col={props.columns.length} />
            ) : isEmpty ? (
              <TableEmpty col={props.columns.length} />
            ) : (
              props.datas?.map((data, i) => {
                return (
                  <tr
                    key={i}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted even:bg-accent/25"
                    data-state="false"
                  >
                    {props.columns?.map((item, i) => (
                      <TableRow key={i}>
                        <>{item.render ? item.render(data) : data[item.key]}</>
                      </TableRow>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface TableLoaderProps {
  col: number;
}

export const TableLoader = ({ col }: TableLoaderProps) => {
  return (
    <tr>
      <td colSpan={col} className="text-center py-10">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        <div className="mt-2 text-sm text-muted-foreground">
          Loading data...
        </div>
      </td>
    </tr>
  );
};

interface TableEmptyProps {
  col: number;
  message?: string;
}

export const TableEmpty = ({
  message = "No data found.",
  col,
}: TableEmptyProps) => {
  return (
    <tr>
      <td colSpan={col} className="text-center py-10">
        <div className="text-muted-foreground text-sm">{message}</div>
      </td>
    </tr>
  );
};
