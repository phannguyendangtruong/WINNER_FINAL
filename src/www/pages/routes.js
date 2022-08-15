import { lazy } from 'react'

//Layouts:
import MarketLayout from '../components/layout/market-layout'
import createUser from './create-user'

//Pages
const HomePage = lazy(() => import("./home"))
const DetailNft = lazy(() => import("./detail-nft"))
const CreateNft = lazy(() => import("./create-nft"))
const Started = lazy(() => import("./started"))
const Profile = lazy(() => import("./profile"))
const Ranking = lazy(() => import("./ranking"))
const CreateUser = lazy(() => import("./create-user"))

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
        path: "/profile",
        exact: true,
        public: true,
        component: Profile,
        layout: MarketLayout
    },
    {
        path: "nfts",
        exact: true,
        public: true,
        component: HomePage,
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
        component: createUser,
        layout: MarketLayout
    },

]

export default routes