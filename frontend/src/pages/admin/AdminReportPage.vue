<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-weight-bold">Reports</div>
        <div class="text-subtitle2 text-grey-7">Overview of school activity and performance</div>
      </div>

      <div class="col-12 col-md-auto row q-gutter-sm">
        <q-btn color="primary" icon="download" label="Export CSV" />
        <q-btn flat color="primary" icon="print" label="Print" />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div
        v-for="item in summaryCards"
        :key="item.label"
        class="col-12 col-sm-6 col-lg-3"
      >
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-caption text-grey-7">{{ item.label }}</div>
              <div class="text-h6 text-weight-bold">{{ item.value }}</div>
            </div>
            <q-icon :name="item.icon" :color="item.color" size="28px" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section class="row items-center q-col-gutter-sm">
        <div class="col-12 col-md">
          <div class="text-subtitle1 text-weight-medium">Monthly Report Snapshot</div>
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="filter"
            dense
            outlined
            clearable
            debounce="250"
            placeholder="Search reports"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        :rows="reportRows"
        :columns="reportColumns"
        row-key="id"
        :filter="filter"
        flat
      >
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge
              rounded
              :color="props.value === 'Completed' ? 'positive' : 'warning'"
              text-color="white"
              :label="props.value"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const filter = ref('')

const summaryCards = [
  { label: 'Total Students', value: '1,248', icon: 'groups', color: 'primary' },
  { label: 'Active Courses', value: '42', icon: 'menu_book', color: 'secondary' },
  { label: 'Attendance Rate', value: '94%', icon: 'fact_check', color: 'positive' },
  { label: 'Pending Reviews', value: '17', icon: 'rate_review', color: 'warning' },
]

const reportColumns = [
  { name: 'title', label: 'Report', field: 'title', align: 'left', sortable: true },
  { name: 'category', label: 'Category', field: 'category', sortable: true },
  { name: 'period', label: 'Period', field: 'period', sortable: true },
  { name: 'owner', label: 'Owner', field: 'owner', sortable: true },
  { name: 'status', label: 'Status', field: 'status', sortable: true },
]

const reportRows = [
  {
    id: 1,
    title: 'Student Progress Summary',
    category: 'Academic',
    period: 'March 2026',
    owner: 'Registrar',
    status: 'Completed',
  },
  {
    id: 2,
    title: 'Course Completion Rates',
    category: 'Courses',
    period: 'March 2026',
    owner: 'Academic Affairs',
    status: 'Completed',
  },
  {
    id: 3,
    title: 'Instructor Performance',
    category: 'Faculty',
    period: 'Q1 2026',
    owner: 'HR Office',
    status: 'In Review',
  },
  {
    id: 4,
    title: 'System Login Audit',
    category: 'Security',
    period: 'March 2026',
    owner: 'IT Department',
    status: 'In Review',
  },
]
</script>
