<template>
  <div class="p-6 bg-white rounded-lg shadow-sm m-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">游戏内容管理</h2>
      <el-button type="primary" @click="openAddDialog">
        + 新增游戏
      </el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column label="封面" width="100" align="center">
        <template #default="scope">
          <el-image
            :src="scope.row.cover"
            class="w-12 h-12 rounded-md"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="游戏名称" width="180" />
      <el-table-column prop="tag" label="标签" width="100">
        <template #default="scope">
          <el-tag size="small">{{ scope.row.tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="rating" label="评分" width="80" align="center" />
      <el-table-column prop="downloads" label="下载量" width="120" />
      <el-table-column label="操作" fixed="right" min-width="120">
        <template #default="scope">
          <el-popconfirm title="确定要删除这个游戏吗？" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button type="danger" size="small" plain>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="新增游戏" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="游戏名称">
          <el-input v-model="formData.title" placeholder="如：元气骑士" />
        </el-form-item>
        <el-form-item label="封面图片URL">
          <el-input v-model="formData.cover" placeholder="输入网络图片地址(http...)" />
        </el-form-item>
        <el-form-item label="分类标签">
          <el-select v-model="formData.tag" placeholder="选择标签" class="w-full">
            <el-option label="动作冒险" value="动作" />
            <el-option label="角色扮演" value="RPG" />
            <el-option label="二次元" value="二次元" />
            <el-option label="策略" value="策略" />
          </el-select>
        </el-form-item>
        <el-form-item label="一句话简介">
          <el-input v-model="formData.short_desc" placeholder="简短吸引人的描述" />
        </el-form-item>
        <el-form-item label="初始评分">
          <el-input-number v-model="formData.rating" :min="1" :max="5" :step="0.1" />
        </el-form-item>
        <el-form-item label="虚假下载量">
          <el-input v-model="formData.downloads" placeholder="如：10w+" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdd" :loading="submitLoading">确定添加</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const BASE_URL = 'http://localhost:3000'

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)

const formData = ref({
  title: '',
  cover: '',
  tag: '动作',
  short_desc: '',
  rating: 5.0,
  downloads: '1w+'
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/admin/games`).then(r => r.json())
    if (res.code === 0) {
      tableData.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取列表失败')
  }
  loading.value = false
}

onMounted(() => {
  fetchList()
})

const openAddDialog = () => {
  formData.value = { title: '', cover: '', tag: '动作', short_desc: '', rating: 5.0, downloads: '1w+' }
  dialogVisible.value = true
}

const submitAdd = async () => {
  if (!formData.value.title || !formData.value.cover) {
    return ElMessage.warning('名称和封面URL不能为空')
  }
  
  submitLoading.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    }).then(r => r.json())
    
    if (res.code === 0) {
      ElMessage.success('添加成功！')
      dialogVisible.value = false
      fetchList()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('网络错误')
  }
  submitLoading.value = false
}

const handleDelete = async (id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/api/games/${id}`, {
      method: 'DELETE'
    }).then(r => r.json())
    
    if (res.code === 0) {
      ElMessage.success('删除成功')
      fetchList()
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}
</script>