<template>
    <div>
        
        <Panel title="学生信息">
            <el-form class="form" :model="student" label-width="120px" label-position="left" size="small">
                <el-form-item label="ID">
                    <el-col :span="11">
                        <el-input
                        type="text"
                        v-model="student.id"
                        disabled>
                        </el-input>
                    </el-col>                    
                </el-form-item>
                <el-form-item label="学号">
                    <el-col :span="11">
                        <el-input
                        type="text"
                        v-model="student.sid">
                        </el-input>
                    </el-col>                    
                </el-form-item>
                <el-form-item label="姓名">
                    <el-input
                    type="text"
                    v-model="student.name"
                    >
                    </el-input>
                </el-form-item>
                <el-form-item label="学院">
                    <el-col :span="11">
                        <el-input
                        type="text"
                        v-model="student.sub_college">
                        </el-input>
                    </el-col>                    
                </el-form-item>
                <el-form-item label="专业">
                    <el-col :span="11">
                        <el-input
                        type="text"
                        v-model="student.profession">
                        </el-input>
                    </el-col>                    
                </el-form-item>
                <el-form-item label="班级">
                    <el-col :span="11">
                        <el-input
                        type="text"
                        v-model="student.s_class">
                        </el-input>
                    </el-col>                    
                </el-form-item>
                <el-switch
                v-model="student.enable"
                active-text="启用"
                inactive-text="禁用">
                </el-switch>
            </el-form>
            <el-button type="primary" size="small"
               @click="createStudent" icon="el-icon-check">
                创建
            </el-button>
            
        </Panel>
        
    </div>
</template>



<script>
import api from '../../../api.js'
import utils from '@/utils/utils'
//创建考试
export default {
  name: 'StudentCreate',
  data () {
    return {
      student: {
        id: 0,
        sid:"",
        name: "",
        sub_college: "",
        profession: "",
        s_class: "",
        enable: true,       
      }
    }
  },
  methods: {
    createStudent () {
      // Logic to create an exam
      api["createStudent"](this.student).then(response => {
        if (response.status === 200) {
          this.$message.success('学生创建成功')
          this.$router.push({ path: '/student/get_list' })
        } else {
          this.$message.error('学生创建失败')
        }
      }).catch(error => {
        console.error(error)
        this.$message.error('学生创建过程中出现错误：' + error.message)
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