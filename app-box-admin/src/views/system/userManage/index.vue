<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam" :tool-button="false">
      <template #avatar="scope">
        <el-avatar :size="40" :src="scope.row.avatar" />
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";

const proTable = ref();
const initParam = reactive({});

// 适配 ProTable 的请求函数
const getTableList = async (params: any) => {
  try {
    const res = await fetch("http://localhost:3000/api/admin/users").then(r => r.json());
    let list = res.data || [];

    // 前端模拟搜索（等后端有真实查询接口可去掉）
    if (params.username) {
      list = list.filter((item: any) => item.username.includes(params.username));
    }

    // ProTable 需要特定的返回结构
    return {
      data: {
        list: list,
        pageNum: 1,
        pageSize: 10,
        total: list.length
      }
    };
  } catch (error) {
    return { data: { list: [], total: 0 } };
  }
};

// 定义超级表格的列配置
const columns = reactive<ColumnProps[]>([
  { type: "index", label: "#", width: 80 },
  { prop: "id", label: "正式玩家ID", width: 120 },
  { prop: "username", label: "用户名", search: { el: "input", tooltip: "输入用户名搜索" } },
  { prop: "avatar", label: "专属萌宠头像", width: 120 },
  { prop: "created_at", label: "注册时间" }
]);
</script>
