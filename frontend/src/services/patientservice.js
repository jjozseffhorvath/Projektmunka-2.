import Axios from "axios";

Axios.defaults.baseURL = "http://localhost:3000";

export default {
    getAllPatients() {
        return Axios.get('/api/project')
            .then(response => {
                return response.data;
            })
            .catch(err => {
                console.error(err);
            })
    }
}