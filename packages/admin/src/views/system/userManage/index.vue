<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam" :tool-button="true">
      <template #avatar="scope">
        <el-avatar :size="40" :src="scope.row.avatar" />
      </template>

      <template #user_status="scope">
        <el-tag :type="Number(scope.row.user_status) === 2 ? 'danger' : 'success'" effect="light">
          {{ Number(scope.row.user_status) === 2 ? "已冻结" : "正常" }}
        </el-tag>
      </template>

      <template #operation="scope">
        <el-space wrap>
          <el-button type="primary" link size="small" icon="EditPen" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="warning" link size="small" @click="handleResetPassword(scope.row)">重置密码</el-button>
          <el-button
            :type="Number(scope.row.user_status) === 2 ? 'success' : 'danger'"
            link
            size="small"
            @click="openStatusDialog(scope.row)"
          >
            {{ Number(scope.row.user_status) === 2 ? "解冻" : "冻结" }}
          </el-button>
          <el-button type="info" link size="small" @click="openLogDialog(scope.row)">冻结日志</el-button>
        </el-space>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" title="编辑用户信息" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="90px">
        <el-form-item label="账号">
          <el-input v-model="formData.username" disabled />
        </el-form-item>
        <el-form-item>
          <div class="text-xs text-gray-400">账号唯一且不可修改，如需更换请新建账号。</div>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="formData.password" type="password" show-password placeholder="不修改可留空" />
        </el-form-item>
        <el-alert title="如填写新密码，用户当前登录态会失效，需要重新登录。" type="info" :closable="false" show-icon />
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="statusDialogVisible" :title="statusDialogTitle" width="520px" destroy-on-close>
      <el-form ref="statusFormRef" :model="statusForm" :rules="statusRules" label-width="90px">
        <el-form-item label="账号">
          <el-input :model-value="selectedUser.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input :model-value="selectedUser.nickname" disabled />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="statusForm.operator" maxlength="20" placeholder="请输入操作人" />
        </el-form-item>
        <el-form-item label="备注原因" prop="reason">
          <el-input
            v-model="statusForm.reason"
            type="textarea"
            :rows="4"
            :placeholder="Number(statusForm.status) === 2 ? '请输入冻结原因，前台登录会显示该原因' : '可选填写解冻说明'"
          />
        </el-form-item>
        <el-alert
          :title="
            Number(statusForm.status) === 2
              ? '冻结后该用户当前登录态将立即失效，且无法继续登录。'
              : '解冻后用户可重新登录，建议保留本次操作说明。'
          "
          :type="Number(statusForm.status) === 2 ? 'warning' : 'success'"
          :closable="false"
          show-icon
        />
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button
          :type="Number(statusForm.status) === 2 ? 'danger' : 'success'"
          :loading="statusSubmitLoading"
          @click="submitStatus"
        >
          {{ Number(statusForm.status) === 2 ? "确认冻结" : "确认解冻" }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="logDialogVisible" title="冻结日志" width="760px" destroy-on-close>
      <el-table v-loading="logLoading" :data="statusLogs" border>
        <el-table-column prop="created_at" label="操作时间" min-width="180" />
        <el-table-column label="操作类型" min-width="120">
          <template #default="scope">
            <el-tag :type="scope.row.action === 'freeze' ? 'danger' : 'success'" effect="light">
              {{ scope.row.action === "freeze" ? "冻结" : "解冻" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="备注原因" min-width="240" show-overflow-tooltip />
        <el-table-column prop="operator_name" label="操作人" min-width="120" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";

const BASE_URL = "http://localhost:3000";

type UserRow = {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  created_at: string;
  user_status: number;
  status_reason: string;
  status_changed_at: string;
  status_changed_by: string;
};

type StatusLog = {
  id: number;
  action: "freeze" | "unfreeze";
  reason: string;
  operator_name: string;
  created_at: string;
};

const proTable = ref();
const initParam = reactive({});

const dialogVisible = ref(false);
const submitLoading = ref(false);
const statusDialogVisible = ref(false);
const statusSubmitLoading = ref(false);
const logDialogVisible = ref(false);
const logLoading = ref(false);

const currentId = ref<number | null>(null);
const selectedUser = reactive<Partial<UserRow>>({});

const formRef = ref<FormInstance>();
const statusFormRef = ref<FormInstance>();

const formData = reactive({
  username: "",
  nickname: "",
  password: ""
});

const statusForm = reactive({
  status: 2,
  operator: "后台管理员",
  reason: ""
});

const statusLogs = ref<StatusLog[]>([]);

const rules = reactive({
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 20, message: "昵称长度需为2-20位", trigger: "blur" }
  ],
  password: [{ min: 6, max: 20, message: "密码长度需为6-20位", trigger: "blur" }]
});

const statusRules = reactive({
  operator: [{ required: true, message: "请输入操作人", trigger: "blur" }],
  reason: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (Number(statusForm.status) === 2 && !String(value || "").trim()) {
          callback(new Error("冻结账号时必须填写原因"));
          return;
        }
        callback();
      },
      trigger: "blur"
    }
  ]
});

const statusDialogTitle = computed(() => (Number(statusForm.status) === 2 ? "冻结账号" : "解冻账号"));

const getTableList = async (params: Record<string, string>) => {
  try {
    const query = new URLSearchParams();
    if (params.username) query.set("username", params.username);
    if (params.nickname) query.set("nickname", params.nickname);
    const requestUrl = `${BASE_URL}/api/admin/users${query.toString() ? `?${query.toString()}` : ""}`;
    const res = await fetch(requestUrl).then(r => r.json());
    const list = (res.data || []) as UserRow[];

    return {
      data: {
        list,
        pageNum: 1,
        pageSize: 10,
        total: list.length
      }
    };
  } catch (error) {
    return {
      data: {
        list: [],
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
    };
  }
};

const columns = reactive<ColumnProps[]>([
  { type: "index", label: "#", width: 80 },
  { prop: "id", label: "正式玩家ID", width: 120 },
  { prop: "avatar", label: "头像", width: 100 },
  { prop: "username", label: "账号", minWidth: 180, search: { el: "input", tooltip: "输入账号搜索" } },
  { prop: "nickname", label: "昵称", minWidth: 160, search: { el: "input", tooltip: "输入昵称搜索" } },
  { prop: "user_status", label: "状态", width: 120 },
  { prop: "created_at", label: "注册时间", minWidth: 180 },
  { prop: "operation", label: "操作", width: 280, fixed: "right" }
]);

const refreshTable = () => {
  proTable.value?.getTableList();
};

const handleEdit = (row: UserRow) => {
  currentId.value = row.id;
  formData.username = row.username || "";
  formData.nickname = row.nickname || "";
  formData.password = "";
  dialogVisible.value = true;
};

const handleResetPassword = async (row: UserRow) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/users/${row.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }).then(r => r.json());

    if (res.code !== 0) {
      ElMessage.error(res.message || "重置密码失败");
      return;
    }

    await navigator.clipboard.writeText(res.data.randomPassword);
    ElMessage.success(`密码已重置为 ${res.data.randomPassword}，已复制到剪贴板`);
  } catch (error) {
    ElMessage.error("重置密码失败，请稍后重试");
  }
};

const submitForm = () => {
  formRef.value?.validate(async valid => {
    if (!valid || !currentId.value) return;
    submitLoading.value = true;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users/${currentId.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: formData.nickname.trim(),
          password: formData.password.trim()
        })
      }).then(r => r.json());

      if (res.code !== 0) {
        ElMessage.error(res.message || "保存失败");
        return;
      }

      ElMessage.success("用户信息更新成功");
      dialogVisible.value = false;
      refreshTable();
    } catch (error) {
      ElMessage.error("保存失败");
    } finally {
      submitLoading.value = false;
    }
  });
};

const openStatusDialog = (row: UserRow) => {
  currentId.value = row.id;
  Object.assign(selectedUser, row);
  statusForm.status = Number(row.user_status) === 2 ? 1 : 2;
  statusForm.operator = "后台管理员";
  statusForm.reason = Number(row.user_status) === 2 ? "" : row.status_reason || "";
  statusDialogVisible.value = true;
};

const submitStatus = () => {
  statusFormRef.value?.validate(async valid => {
    if (!valid || !currentId.value) return;
    statusSubmitLoading.value = true;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users/${currentId.value}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: Number(statusForm.status),
          operator: statusForm.operator.trim(),
          reason: statusForm.reason.trim()
        })
      }).then(r => r.json());

      if (res.code !== 0) {
        ElMessage.error(res.message || "状态更新失败");
        return;
      }

      ElMessage.success(res.message || "状态更新成功");
      statusDialogVisible.value = false;
      refreshTable();
    } catch (error) {
      ElMessage.error("状态更新失败");
    } finally {
      statusSubmitLoading.value = false;
    }
  });
};

const openLogDialog = async (row: UserRow) => {
  currentId.value = row.id;
  logDialogVisible.value = true;
  logLoading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/users/${row.id}/status-logs`).then(r => r.json());
    statusLogs.value = (res.data || []) as StatusLog[];
  } catch (error) {
    statusLogs.value = [];
    ElMessage.error("获取冻结日志失败");
  } finally {
    logLoading.value = false;
  }
};
</script>
