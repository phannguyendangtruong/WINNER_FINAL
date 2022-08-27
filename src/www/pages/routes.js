import { lazy } from 'react'

//Layouts:
import MarketLayout from '../components/layout/market-layout'
import createUser from './create-user'

//Pages
const ListNft = lazy(() => import("./list-nft"))
const DetailNft = lazy(() => import("./detail-nft"))
const CreateNft = lazy(() => import("./create-nft"))
const Started = lazy(() => import("./started"))
const Profile = lazy(() => import("./profile"))
const Ranking = lazy(() => import("./ranking"))
const CreateUser = lazy(() => import("./create-user"))
const CreateUserExcel = lazy(() => import("./create-user-excel"))
const ManageUser = lazy(() => import("./manage-user"))
const ManageDegree = lazy(() => import("./manage-degree"))
const Manage = lazy(() => import("./manage"))
const CreateSchool = lazy(() => import("./create-school"))
const ManageSchool = lazy(() => import("./manage-school"))
const DetaiSchool = lazy(() => import("./detail-school"))
const routes = [
    {
        path: "/",
        exact: true,
        public: true,
        component: Started,
        layout: MarketLayout
    },
    {
        path: "/nft/:id",
        exact: true,
        public: true,
        component: DetailNft,
        layout: MarketLayout
    },
    {
        path: "/nft/create",
        exact: true,
        public: true,
        component: CreateNft,
        layout: MarketLayout
    },
    {
        path: "/started",
        exact: true,
        public: true,
        component: Started,
        layout: MarketLayout
    },
    {
        path: "/profile/:address",
        exact: true,
        public: true,
        component: Profile,
        layout: MarketLayout
    },
    {
        path: "nfts",
        exact: true,
        public: true,
        component: ListNft,
        layout: MarketLayout
    },
    {
        path: "ranking",
        exact: true,
        public: true,
        component: Ranking,
        layout: MarketLayout
    },
    {
        path: "create-user",
        exact: true,
        public: true,
        component: CreateUser,
        layout: MarketLayout
    },
    {
        path: "create-user-excel",
        exact: true,
        public: true,
        component: CreateUserExcel,
        layout: MarketLayout
    },
    {
        path: "create-school",
        exact: true,
        public: true,
        component: CreateSchool,
        layout: MarketLayout
    },
    {
        path: "manage-user",
        exact: true,
        public: true,
        component: ManageUser,
        layout: MarketLayout
    },
    {
        path: "manage-degree",
        exact: true,
        public: true,
        component: ManageDegree,
        layout: MarketLayout
    },
    {
        path: "manage",
        exact: true,
        public: true,
        component: Manage,
        layout: MarketLayout
    },
    {
        path: "manage-school",
        exact: true,
        public: true,
        component: ManageSchool,
        layout: MarketLayout
    },
    {
        path: "manage-school/:id",
        exact: true,
        public: true,
        component: DetaiSchool,
        layout: MarketLayout
    }
]

export default routes