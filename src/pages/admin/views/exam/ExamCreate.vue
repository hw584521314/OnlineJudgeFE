<template>
<div class="view">
  <Panel :title="this.$i18n.t('m.Exam_Create')">
    <el-form class="form" :model="exam" label-width="120px" label-position="left" size="small">
      <el-form-item label="考卷名称">
            <el-col :span="10">
                <el-input 
                type="text"
                v-model="exam.title"
                placeholder="考试20250101">
                </el-input>
            </el-col>
        </el-form-item>  
      <el-form-item label="考试时间">
            <el-col :span="5">
                <el-input
                v-model="exam.start_time"
                type="datetime-local"
                placeholder="开始时间">
                </el-input>
            </el-col>
            <el-col :span="5">
                <el-input
                v-model="exam.end_time"
                type="datetime-local"
                placeholder="结束时间">
                </el-input>
            </el-col>
        </el-form-item>
        <el-form-item label="考卷简介">
            <el-col :span="10">
              <Simditor v-model="exam.desc"></Simditor>
                <!-- <el-input 
                type="textarea"
                v-model="exam.desc"
                placeholder="简介">
                </el-input> -->
            </el-col>
        </el-form-item>
        <el-switch
          v-model="exam.enable"
          active-text="启用"
          inactive-text="禁用">
        </el-switch>
    </el-form>
    <el-button type="primary" size="small"
                    @click="createExam" icon="el-icon-plus">
        创建
    </el-button>
  </Panel>
</div>
</template>

<script>
import api from '../../api.js'
import Simditor from '../../components/Simditor.vue'
import utils from '@/utils/utils'
//创建考试
export default {
  name: 'ExamCreate',
  data () {
    return {
      exam: {
        start_time: '',
        end_time: '',
        desc: '',
        enable: false,       
      }
    }
  },
  components: {
    Simditor
  },
  methods: {
    createExam () {
      // Logic to create an exam
      api["createExam"](this.exam).then(response => {
        if (response.status === 200) {
          this.$message.success('考试创建成功')
          this.$router.push({ path: '/exam/get_list' })
        } else {
          this.$message.error('考试创建失败')
        }
      }).catch(error => {
        console.error(error)
        this.$message.error('考试创建过程中出现错误：' + error.message)
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