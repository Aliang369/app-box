<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam" :tool-button="false">
      <template #gift_code="scope">
        <el-tag type="success" effect="plain" class="font-mono font-bold">{{ scope.row.gift_code }}</el-tag>
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

// 获取领取记录列表
const getTableList = async (params: any) => {
  try {
    const res = await fetch("http://localhost:3000/api/admin/gift-records").then(r => r.json());
    let list = res.data || [];

    // 前端模拟按用户名或激活码搜索（等后端支持后可直接传 params）
    if (params.username) {
      list = list.filter((item: any) => item.username && item.username.includes(params.username));
    }
    if (params.gift_code) {
      list = list.filter((item: any) => item.gift_code && item.gift_code.includes(params.gift_code));
    }

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
  { prop: "username", label: "领取用户", width: 150, search: { el: "input", tooltip: "输入用户名搜索" } },
  { prop: "title", label: "领取的游戏名称", minWidth: 150 },
  { prop: "gift_code", label: "激活码", width: 200, search: { el: "input" } },
  { prop: "created_at", label: "领取时间", width: 180 }
]);
</script>
