import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({
  per_page,
  page,
  search,
  target,
  city_id,
  available,
  gender,
  register_date,
  birth_date,
  employee_id,
  reason_id,
}) => {
  const queryResult = useQuery({
    queryKey: [
      "get-all-patients",
      per_page,
      page,
      search,
      target,
      city_id,
      available,
      gender,
      register_date,
      birth_date,
      employee_id,
      reason_id,
    ],
    queryFn: () =>
      apis.getAll({
        per_page,
        page,
        search,
        target,
        city_id,
        available,
        gender,
        register_date,
        birth_date,
        employee_id,
        reason_id,
      }),
  });
  return queryResult;
};
const GetInfinitePatients = ({
  per_page,
  page,
  search,
  target,
  city_id,
  gender,
  register_date,
  birth_date,
}) => {
  const query = useInfiniteQuery({
    queryKey: [
      "infinite-patients",
      per_page,
      page,
      search,
      target,
      city_id,
      gender,
      register_date,
      birth_date,
    ],
    queryFn: ({ pageParam = 1 }) =>
      apis.getAll({
        per_page,
        page: pageParam,
        search,
        target,
        city_id,
        gender,
        register_date,
        birth_date,
      }),
    getNextPageParam: lastPage => {
      if (lastPage.meta && lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    select: data => ({
      pages: data.pages.map(page => ({
        data: page.data,
        pagination: {
          currentPage: page.meta.current_page,
          lastPage: page.meta.last_page,
          total: page.meta.total,
          perPage: page.meta.per_page,
          links: page.links,
          meta: page.meta,
        },
      })),
      pageParams: data.pageParams,
    }),
  });

  return query;
};
const GetAllPatients = () => {
  const queryResult = useQuery({
    queryKey: ["all-patients-dropdown"],
    queryFn: async () => {
      const response = await apis.getAll({
        per_page: 10000,
        page: 1,
        search: null,
        target: null,
        city_id: null,
        gender: null,
        register_date: null,
        birth_date: null,
      });
      return response.data;
    },
  });
  return queryResult;
};

const GetAllUnPaidPatients = ({ PaitientId }) => {
  const queryResult = useQuery({
    queryKey: ["get-unpaid-patients", PaitientId],
    queryFn: async () => {
      const response = await apis.getUnPaidPatientOne({ PaitientId });
      return response.data;
    },
    enabled: PaitientId > 0,
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-patient", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const usePatientsQueries = {
  GetAll,
  GetOne,
  GetInfinitePatients,
  GetAllPatients,
  GetAllUnPaidPatients,
};
