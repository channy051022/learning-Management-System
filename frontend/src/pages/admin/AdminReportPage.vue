<template>
  <q-page class="report-page q-pa-md">
    <div class="row items-start justify-between q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-weight-bold">Reports</div>
        <div class="text-subtitle2 text-grey-7">
          Monitor academic and system performance across departments
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">Last updated: April 9, 2026</div>
      </div>

      <div class="col-12 col-md-auto row q-gutter-sm">
        <q-btn
          color="primary"
          icon="refresh"
          label="Refresh"
          :loading="isLoading"
          @click="refreshData"
        />
        <q-btn outline color="primary" icon="description" label="Generate PDF" @click="generatePdf" />
        <q-btn flat color="primary" icon="download" label="Export CSV" @click="exportCsv" />
      </div>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="dateRange"
            :options="dateRangeOptions"
            outlined
            dense
            label="Date range"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="selectedDepartment"
            :options="departmentOptions"
            outlined
            dense
            label="Department"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="searchQuery"
            outlined
            dense
            clearable
            debounce="250"
            placeholder="Search reports or owners"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="item in summaryCards" :key="item.label" class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-caption text-grey-7">{{ item.label }}</div>
              <div class="text-h6 text-weight-bold">{{ item.value }}</div>
              <div
                class="text-caption"
                :class="item.positive ? 'text-positive' : 'text-negative'"
              >
                {{ item.trend }}
              </div>
            </div>
            <q-avatar square size="44px" :color="item.iconBg" text-color="white">
              <q-icon :name="item.icon" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-lg-7">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Course Completion Snapshot</div>
            <div
              v-for="course in courseCompletion"
              :key="course.name"
              class="q-mb-sm"
            >
              <div class="row items-center justify-between text-caption q-mb-xs">
                <div>{{ course.name }}</div>
                <div class="text-weight-medium">{{ course.completion }}%</div>
              </div>
              <q-linear-progress
                size="10px"
                rounded
                :value="course.completion / 100"
                :color="course.color"
                track-color="grey-3"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-md">Submission Status</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6" v-for="status in statusSummary" :key="status.label">
                <q-card flat bordered class="status-card">
                  <q-card-section class="q-pa-sm">
                    <div class="text-caption text-grey-7">{{ status.label }}</div>
                    <div class="text-h6 text-weight-bold">{{ status.value }}</div>
                    <q-chip dense square :color="status.color" text-color="white">
                      {{ status.note }}
                    </q-chip>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-subtitle1 text-weight-medium">Detailed Report Records</div>
          <div class="text-caption text-grey-7">
            {{ filteredRows.length }} record{{ filteredRows.length === 1 ? '' : 's' }} found
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        :rows="filteredRows"
        :columns="reportColumns"
        row-key="id"
        :filter="searchQuery"
        :loading="isLoading"
        flat
      >
        <template #body-cell-completion="props">
          <q-td :props="props" style="min-width: 150px;">
            <div class="text-caption q-mb-xs">{{ props.value }}%</div>
            <q-linear-progress
              rounded
              size="8px"
              :value="props.value / 100"
              :color="props.value >= 90 ? 'positive' : props.value >= 75 ? 'warning' : 'negative'"
              track-color="grey-3"
            />
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge rounded :color="statusColorMap[props.value] || 'grey'" text-color="white">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              dense
              flat
              icon="visibility"
              color="primary"
              @click="viewReport(props.row.title)"
            />
            <q-btn dense flat icon="download" color="primary" @click="downloadReport(props.row.title)" />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-gutter-sm q-pa-lg">
            <q-icon name="folder_open" size="22px" />
            <span>No report data available for this filter.</span>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const isLoading = ref(false)
const searchQuery = ref('')
const dateRange = ref('This Month')
const selectedDepartment = ref('All Departments')

const dateRangeOptions = ['This Week', 'This Month', 'This Quarter', 'This Year']
const departmentOptions = ['All Departments', 'Academic', 'Registrar', 'IT', 'HR', 'Finance']

const summaryCards = [
  {
    label: 'Total Students',
    value: '1,248',
    trend: '+3.6% vs last month',
    icon: 'groups',
    iconBg: 'primary',
    positive: true,
  },
  {
    label: 'Report Completion',
    value: '88.4%',
    trend: '+1.2% vs last month',
    icon: 'task_alt',
    iconBg: 'positive',
    positive: true,
  },
  {
    label: 'Pending Reviews',
    value: '17',
    trend: '-4 items this week',
    icon: 'rate_review',
    iconBg: 'warning',
    positive: true,
  },
  {
    label: 'Flagged Issues',
    value: '5',
    trend: '+2 from previous week',
    icon: 'warning_amber',
    iconBg: 'negative',
    positive: false,
  },
]

const courseCompletion = [
  { name: 'Mathematics', completion: 95, color: 'positive' },
  { name: 'Science', completion: 90, color: 'primary' },
  { name: 'English', completion: 87, color: 'secondary' },
  { name: 'Computer Studies', completion: 78, color: 'warning' },
]

const statusSummary = [
  { label: 'Completed', value: 29, note: 'On time', color: 'positive' },
  { label: 'In Review', value: 7, note: 'Needs approval', color: 'warning' },
  { label: 'Overdue', value: 3, note: 'Action needed', color: 'negative' },
  { label: 'Draft', value: 11, note: 'Still preparing', color: 'primary' },
]

const reportColumns = [
  { name: 'title', label: 'Report', field: 'title', align: 'left', sortable: true },
  { name: 'department', label: 'Department', field: 'department', sortable: true },
  { name: 'period', label: 'Period', field: 'period', sortable: true },
  { name: 'owner', label: 'Owner', field: 'owner', sortable: true },
  { name: 'completion', label: 'Completion', field: 'completion', sortable: true },
  { name: 'status', label: 'Status', field: 'status', sortable: true },
  { name: 'updatedAt', label: 'Updated', field: 'updatedAt', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

const reportRows = [
  {
    id: 1,
    title: 'Student Progress Summary',
    department: 'Academic',
    period: 'April 2026',
    owner: 'Registrar',
    completion: 100,
    status: 'Completed',
    updatedAt: 'Apr 08, 2026',
  },
  {
    id: 2,
    title: 'Course Completion Rates',
    department: 'Academic',
    period: 'April 2026',
    owner: 'Academic Affairs',
    completion: 94,
    status: 'Completed',
    updatedAt: 'Apr 07, 2026',
  },
  {
    id: 3,
    title: 'Faculty Performance Review',
    department: 'HR',
    period: 'Q2 2026',
    owner: 'HR Office',
    completion: 76,
    status: 'In Review',
    updatedAt: 'Apr 06, 2026',
  },
  {
    id: 4,
    title: 'Infrastructure Usage Audit',
    department: 'IT',
    period: 'April 2026',
    owner: 'IT Department',
    completion: 72,
    status: 'In Review',
    updatedAt: 'Apr 05, 2026',
  },
  {
    id: 5,
    title: 'Budget Allocation Report',
    department: 'Finance',
    period: 'Q2 2026',
    owner: 'Finance Office',
    completion: 54,
    status: 'Overdue',
    updatedAt: 'Apr 04, 2026',
  },
  {
    id: 6,
    title: 'Enrollment Statistics',
    department: 'Registrar',
    period: 'April 2026',
    owner: 'Admissions',
    completion: 83,
    status: 'Draft',
    updatedAt: 'Apr 03, 2026',
  },
]

const statusColorMap = {
  Completed: 'positive',
  'In Review': 'warning',
  Overdue: 'negative',
  Draft: 'primary',
}

const filteredRows = computed(() =>
  reportRows.filter((row) => {
    if (selectedDepartment.value !== 'All Departments' && row.department !== selectedDepartment.value) {
      return false
    }

    if (dateRange.value === 'This Quarter') {
      return row.period.includes('Q2')
    }

    if (dateRange.value === 'This Year') {
      return row.period.includes('2026')
    }

    return true
  }),
)

function refreshData() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    $q.notify({ type: 'positive', message: 'Report data refreshed.' })
  }, 800)
}

function exportCsv() {
  $q.notify({ type: 'info', message: 'CSV export started.' })
}

function generatePdf() {
  $q.notify({ type: 'info', message: 'PDF generation queued.' })
}

function viewReport(reportTitle) {
  $q.notify({ type: 'primary', message: `Opening "${reportTitle}"` })
}

function downloadReport(reportTitle) {
  $q.notify({ type: 'info', message: `Downloading "${reportTitle}"` })
}
</script>

<style scoped>
.report-page .status-card {
  min-height: 110px;
}
</style>
