import axios from "axios";

const ApiHttp = (url) => {
    return axios.create({
        baseURL: url
    })
}

export default ApiHttp;