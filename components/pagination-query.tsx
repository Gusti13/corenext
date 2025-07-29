"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryHelpers } from "@/hooks/use-query-helpers";
import { getCenteredPagination } from "@/lib/pagination";

interface PaginationQueryProps {
  pageTotal: number;
}

export function PaginationQuery(props: PaginationQueryProps) {
  const { getQueryParams, setMultipleQueryParams } = useQueryHelpers();

  const params = getQueryParams();
  const currentPage = parseInt(params.get("page") || "1", 10);
  const perPage = params.get("limit") || "10";
  const paginationPages = getCenteredPagination(currentPage, props.pageTotal);

  const goToPage = (page: number) => {
    setMultipleQueryParams({ page: page.toString() });
  };

  const changeLimit = (value: string) => {
    // reset ke page 1 saat ubah limit
    setMultipleQueryParams({ limit: value, page: "1" });
  };

  return (
    <Pagination className="justify-between">
      <Select defaultValue={perPage} onValueChange={changeLimit}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Page length" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Page length</SelectLabel>
            {[10, 25, 50, 100, 200].map((v) => (
              <SelectItem key={v} value={v.toString()}>
                {v}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className="border"
            disabled={currentPage <= 1}
            onClick={() => goToPage(Math.max(currentPage - 1, 1))}
          />
        </PaginationItem>

        {paginationPages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={page === currentPage}
              onClick={() => goToPage(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            className="border"
            disabled={currentPage >= props.pageTotal}
            onClick={() => goToPage(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
