import Login from "../../components/views/Login";
import Test1 from "../../components/views/Test1";
import { View } from "../../shared/interfaces";

const Views: View[] = [
    {
        path: "/",
        component: Login
    },
    {
        path: "/test",
        component: Test1,
    }
]

export default Views;