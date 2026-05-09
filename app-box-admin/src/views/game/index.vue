<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam" :tool-button="true">
      <template #tableHeader>
        <el-button type="primary" icon="Plus" @click="openAddDialog">新增游戏</el-button>
      </template>

      <template #cover="scope">
        <el-image :src="scope.row.cover" style="width: 50px; height: 50px; border-radius: 8px" fit="cover" />
      </template>

      <template #tag="scope">
        <el-tag size="small" effect="plain">{{ scope.row.tag }}</el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link size="small" icon="EditPen" @click="handleEdit(scope.row)">编辑</el-button>
        <el-popconfirm title="确定要彻底删除这个游戏吗？" @confirm="handleDelete(scope.row.id)">
          <template #reference>
            <el-button type="danger" link size="small" icon="Delete">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="游戏名称">
          <el-input v-model="formData.title" placeholder="如：元气骑士" />
        </el-form-item>
        <el-form-item label="封面URL">
          <el-input v-model="formData.cover" placeholder="输入封面图链接" />
        </el-form-item>
        <el-form-item label="分类标签">
          <el-select v-model="formData.tag" placeholder="选择标签" class="w-full">
            <el-option label="动作冒险" value="动作" />
            <el-option label="角色扮演" value="RPG" />
            <el-option label="二次元" value="二次元" />
            <el-option label="策略" value="策略" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="formData.short_desc" type="textarea" placeholder="简短描述" />
        </el-form-item>
        <el-form-item label="评分/下载">
          <div class="flex gap-4">
            <el-input-number v-model="formData.rating" :min="1" :max="5" :step="0.1" />
            <el-input v-model="formData.downloads" placeholder="10w+" style="width: 120px" />
          </div>
        </el-form-item>
        <el-form-item label="游戏截图">
          <div v-for="(url, index) in formData.screenshots" :key="index" class="flex gap-2 mb-2">
            <el-input v-model="formData.screenshots[index]" placeholder="输入截图URL" />
            <el-button type="danger" circle :icon="Delete" @click="formData.screenshots.splice(index, 1)" />
          </div>
          <el-button type="dashed" class="w-full" @click="formData.screenshots.push('')"> + 添加一张截图 </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";

const BASE_URL = "http://localhost:3000";

const proTable = ref();
const initParam = reactive({});
const dialogVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const dialogTitle = computed(() => (isEdit.value ? "编辑游戏信息" : "新增游戏"));

const formData = ref({
  title: "",
  cover: "",
  tag: "动作",
  short_desc: "",
  rating: 5.0,
  downloads: "1w+",
  screenshots: [] as string[]
});

// ProTable 数据请求
const getTableList = async (params: any) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/games`).then(r => r.json());
    let list = res.data || [];

    // 前端模拟按游戏名称搜索
    if (params.title) {
      list = list.filter((item: any) => item.title.includes(params.title));
    }

    // 解析 JSON 截图数据
    list = list.map((item: any) => ({
      ...item,
      screenshots: item.screenshots
        ? typeof item.screenshots === "string"
          ? JSON.parse(item.screenshots)
          : item.screenshots
        : []
    }));

    return {
      list,
      pageNum: 1,
      pageSize: 10,
      total: list.length
    };
  } catch (error) {
    return { list: [], total: 0 };
  }
};

// ProTable 列配置
const columns = reactive<ColumnProps[]>([
  { type: "index", label: "#", width: 80 },
  { prop: "cover", label: "封面", width: 100 },
  { prop: "title", label: "游戏名称", width: 180, search: { el: "input", tooltip: "输入游戏名称搜索" } },
  { prop: "tag", label: "标签", width: 100 },
  { prop: "rating", label: "评分", width: 100 },
  { prop: "downloads", label: "下载量", width: 120 },
  { prop: "operation", label: "操作", fixed: "right", width: 180 }
]);

const openAddDialog = () => {
  isEdit.value = false;
  currentId.value = null;
  formData.value = { title: "", cover: "", tag: "动作", short_desc: "", rating: 5.0, downloads: "1w+", screenshots: [] };
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  isEdit.value = true;
  currentId.value = row.id;
  formData.value = { ...row, screenshots: [...row.screenshots] };
  dialogVisible.value = true;
};

const submitForm = async () => {
  if (!formData.value.title || !formData.value.cover) return ElMessage.warning("名称和封面不能为空");
  submitLoading.value = true;
  const url = isEdit.value ? `${BASE_URL}/api/games/${currentId.value}` : `${BASE_URL}/api/games`;
  const method = isEdit.value ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData.value)
    }).then(r => r.json());

    if (res.code === 0) {
      ElMessage.success(isEdit.value ? "修改成功" : "添加成功");
      dialogVisible.value = false;
      proTable.value?.getTableList(); // 刷新表格
    }
  } catch (error) {
    ElMessage.error("操作失败");
  }
  submitLoading.value = false;
};

const handleDelete = async (id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/api/games/${id}`, { method: "DELETE" }).then(r => r.json());
    if (res.code === 0) {
      ElMessage.success("删除成功");
      proTable.value?.getTableList(); // 刷新表格
    }
  } catch (error) {
    ElMessage.error("删除失败");
  }
};
</script>
