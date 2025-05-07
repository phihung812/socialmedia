
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api_user from '../../service/api';

interface users{
    _id: string,
    username: string,
    email: string,
    role: string
}
const users = ref<users[]>([])
const getUser = async () => {
    try {
        const response = await api_user.get('/user')
        users.value = response.data
console.log(users.value);

    } catch (error) {
        console.error(error);

    }
}

onMounted(()=>{
    getUser()
})



</script>

<template>
    <table class="table">
        <thead class="bg-gray-50">
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in users" :key="user._id">
                <td>{{ user._id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>
                    <button class="btn btn-warning">
                        Edit
                    </button>
                    <button class="btn btn-danger">
                        Delete
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>

</style>