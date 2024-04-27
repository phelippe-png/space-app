import axios from "axios";

const ApiHttp = (url) => {
    return axios.create({
        baseURL: url // 'http://186.251.27.96:15282' //"http://192.168.237.75:15283" // "http://192.168.0.58:9000"
    })
}

export default ApiHttp;