<template>
    <div>
        
        <Panel :title="$t('m.Exam_Info')">
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
                    <el-col :span="11">
                        <el-input
                        v-model="exam.start_time"
                        type="datetime-local"
                        placeholder="开始时间">
                        </el-input>
                    </el-col>
                    <el-col :span="11">
                        <el-input
                        v-model="exam.end_time"
                        type="datetime-local"
                        placeholder="结束时间">
                        </el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="考试简介">
                  <Simditor v-model="exam.desc"></Simditor>
                    <!-- <el-input
                    type="textarea"
                    v-model="exam.desc"
                    placeholder="简介">
                    </el-input> -->
                </el-form-item>
                <el-switch
                v-model="exam.enable"
                active-text="启用"
                inactive-text="禁用">
                </el-switch>
            </el-form>
            <el-button type="primary" size="small"
               @click="updateExam" icon="el-icon-check">
                更新
            </el-button>
            <el-button type="primary" size="small"
               @click="$emit('close')" icon="el-icon-close">
                关闭
            </el-button>
        </Panel>
        
    </div>
</template>


<script>
import api from '../../api.js'
import Simditor from '../../components/Simditor.vue'
//用于Exam的 info or edit
export default {
  name: 'Exam',
  props:{
    exam:{
      type: Object,
      default: () => ({
        id: 0,
        start_time: '',
        end_time: '',
        desc: '',
        enable: true,
      })
    }
  },
  components: {
    Simditor
  },
  data () {
    return{}
  },
  mounted () {

  },
  methods: {
    updateExam () {
      api["updateExam"](this.exam).then(res => {
        if (res.data.error == null) {
          this.$message.success('考试更新成功')
        } else {
          this.$message.error('考试更新失败')
        }
      }).catch(err => {
        this.$message.error('考试更新过程中出现错误：' + err.message)
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