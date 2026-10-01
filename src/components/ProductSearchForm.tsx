"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SORT_FIELDS, SearchQuerySchema, defaultQuery } from "@/lib/products";
import type { SearchQuery } from "@/lib/products";

type ProductSearchFormProps = {
  onSearch: (query: SearchQuery) => Promise<void>;
};

export default function ProductSearchForm({ onSearch }: ProductSearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SearchQuery>({
    resolver: zodResolver(SearchQuerySchema),
    mode: "onTouched",
    defaultValues: defaultQuery,
  });

  return (
    <form className="search-form" onSubmit={handleSubmit(onSearch)} noValidate>
      <input
        id="q"
        className="search-input"
        {...register("q")}
        placeholder="ค้นหาสินค้า"
      />

      <select id="sortBy" className="search-select" {...register("sortBy")}>
        {SORT_FIELDS.map((field) => (
          <option key={field} value={field}>เรียงตาม {field}</option>
        ))}
      </select>

      <div className="search-limit">
        <input
          id="limit"
          className="search-limit-input"
          type="number"
          required
          {...register("limit", { valueAsNumber: true })}
          aria-invalid={!!errors.limit}
          aria-describedby="limit-error"
        />
        <span id="limit-error" className="field-error" role="alert">{errors.limit?.message}</span>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "กำลังค้นหา" : "ค้นหา"}
      </button>
    </form>
  );
}