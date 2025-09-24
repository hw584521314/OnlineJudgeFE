<template>
<div class="view">
  <Panel :title="this.$i18n.t('m.Exam_Create')">
    <el-form class="form" :model="examDetail" label-width="120px" label-position="left" size="small">
        <el-form-item label="试卷名称">
            <el-col :span="5">
                <el-input
                v-model="examDetail.name"
                placeholder="试卷20250801">
                </el-input>
            </el-col>
            
        </el-form-item>
        <el-form-item label="试卷描述">
            <el-col :span="10">
                <el-input 
                type="textarea"
                v-model="examDetail.desc"
                placeholder="简介">
                </el-input>
            </el-col>
        </el-form-item>
        <el-switch
          v-model="examDetail.enable"
          active-text="启用"
          inactive-text="禁用">
        </el-switch>
    </el-form>
    <el-button type="primary" size="small"
                    @click="createExamDetail" icon="el-icon-plus">
        创建
    </el-button>
  </Panel>
</div>
</template>

<script>
import api from '../../api.js'
import utils from '@/utils/utils'
//创建考试
export default {
  name: 'ExamDetailCreate',
  data () {
    return {
      examDetail: {
        name: '',        
        desc: '',
        enable: true,       
      }
    }
  },
  methods: {
    createExamDetail () {
      // Logic to create an exam
      api["createExamDetail"](this.examDetail).then(response => {
        if (response.status === 200) {
          this.$message.success('试卷创建成功')
          this.$router.push({ name: 'exam_detail_list' })
        } else {
          this.$message.error('试卷创建失败')
        }
      }).catch(error => {
        console.error(error)
        this.$message.error('试卷创建过程中出现错误：' + error.message)
      })
    }
  }
}
</script>

<style scoped>
.form{
    margin: 0 0 20px 0;
}
</style>