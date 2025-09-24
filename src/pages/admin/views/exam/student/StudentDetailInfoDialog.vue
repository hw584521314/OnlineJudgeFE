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
               @click="updateStudent" icon="el-icon-check">
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
import api from '../../../api.js'
//
export default {
  name: 'StudentDetailInfoDialog',
  props:{
    student:{
      type: Object,
      default: () => ({
        id: 0,
        sid:"",
        name: "",
        sub_college: "",
        profession: "",
        s_class: "",
        enable: true,
      })
    }
  },
  data () {
    return{}
  },
  mounted () {

  },
  methods: {
    updateStudent () {
        //console.log(this.student)
      api["updateStudent"](this.student).then(res => {
        if (res.data.error == null) {
          this.$message.success('学生信息更新成功')
        } else {
          this.$message.error('学生信息更新失败')
        }
      }).catch(err => {
        this.$message.error('学生信息更新过程中出现错误：' + err.message)
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