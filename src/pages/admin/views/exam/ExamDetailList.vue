<template>
    <Panel title="试卷列表">
        <div slot="header">
            <el-input
                v-model="keyword"
                prefix-icon="el-icon-search"
                placeholder="Keywords">
                <template #append>
        <el-button type="primary" size="small" @click="getExamDetailList">搜索</el-button>
        <el-button type="primary" size="small" @click="resetSearch">重置</el-button>
      </template>
            </el-input>
        </div>
        <el-button type="primary" size="small"
                   @click="createExamDetail" icon="el-icon-plus">Create
        </el-button>
        <el-table :data="examDetailList"
        border
        fit
        v-loading="Loading">
            <el-table-column
                width="50"
                prop="id"
                label="ID">
            </el-table-column>
            <el-table-column
                width="160"
                label="试卷名称">
                <template slot-scope="{row}">
                    {{row.name}}
                </template>
            </el-table-column>
            <el-table-column
                
                label="试卷描述">
                <template slot-scope="{row}">
                    {{row.desc}}
                </template>
            </el-table-column>
            <el-table-column
                width="160"
                label="创建时间">
                <template slot-scope="{row}">
                    {{row.create_time  }}
                </template>
            </el-table-column>
            <el-table-column label="是否启用" width="150">
                <template slot-scope="{row}">
                    <el-switch
                        v-model="row.enable"
                        active-text="启用"
                        inactive-text="禁用"
                        disabled
                        >
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作"  width="200">
                <template slot-scope="{row}">
                    <el-col :span="11">
                        <el-button size="mini" @click="rowEdit(row)">
                            <i class="el-icon-edit"></i> 编辑
                        </el-button>
                    </el-col>
                    <el-col :span="11">
                        <el-button size="mini" @click="rowDelete(row)">
                            <i class="el-icon-delete"></i> 删除
                        </el-button>
                    </el-col>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
          class="page"
          background
          layout="total, sizes,prev, pager, next"
          @current-change="currentChange"
          @size-change="pageSize = $event; getExamDetailList(1)"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total">
    </el-pagination>
    </Panel>
</template>

<script>
import api from '../../api.js'
import utils from '@/utils/utils.js'
export default {
    name: 'ExamDetailList',
    data() {
        return {
            routeName: '',
            keyword: '',
            pageSize: 10,
            currentPage: 1,
            total: 0,
            examDetailList: [],
            Loading: false,
        }
    },
    mounted(){
        this.routeName = this.$route.name;
        
        //查询ExamDetail中是否有数据，如果没有则新建
        this.getExamDetailList(this.currentPage)
    },
    methods: {
        getExamDetailList(page = 1) {
            this.loading = true;
            let params = {
                page_idx: page,
                nums_per_page: this.pageSize,
                keyword: this.keyword,
            };
            
            api["getExamDetailList"](params).then(res => {
                if (res.data.error == null) {
                    this.examDetailList = res.data.data.data;
                    this.total = res.data.data.total;
                    
                } else {
                    utils.showError(res.data.data);
                }
                this.loading = false;
            }).catch(err => {
                utils.showError(err);
                this.loading = false;
            });
        },
        createExamDetail() {
            this.$router.push({name: 'exam-detail-create'});
        },
        resetSearch() {
            this.keyword = "";
            this.getExamDetailList(1);
        },
        rowEdit(row) {
            this.$router.push({name: 'exam-detail-edit', params: {exam_detail_id: row.id}});
        },
        rowDelete(row) {
            this.$confirm('确定要删除试卷?', 'Warning', {
                type: 'warning'
            }).then(() => {
                let data={
                    id: row.id
                }
                api["deleteExamDetail"](data).then(res => {
                    if (res.data.error == null) {
                        this.$message.success('删除成功');
                        this.getExamDetailList(this.currentPage);
                    } else {
                        utils.showError(res.data.data);
                    }
                }).catch(err => {
                    utils.showError(err);
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: 'Cancel'
                });
            });
        },
        currentChange(page) {
            this.currentPage = page;
            this.getExamDetailList(page);
        }
    }
}
</script>

<style scoped>
</style>