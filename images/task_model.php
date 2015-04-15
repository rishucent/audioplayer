<?php
if (!defined('BASEPATH'))
    exit('No direct script access allowed');
class Task_model extends CI_Model {
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
	function addTaskList($pro_id,$title,$filename){
		$task_data = array(
            'name' => $title,
            'datetime' => date('Y:m:d:H:m:s'),
            'created_by' => $this->session->userdata('user_id'),
            'pro_id' => $pro_id
        );
		$this->db->insert('task_list', $task_data); /* insert data into tasks table */
		$task_list_id = $this->db->insert_id();
		if($filename!=''){
			$file_data = array(
				'name' => $filename,
				'datetime' => date('Y:m:d:H:m:s'),
				'uploaded_by' => $this->session->userdata('user_id'),
				'pro_id' => $pro_id,
				'task_list_id' => $task_list_id
			);
			$this->db->insert('uploaded_files', $file_data);
		}		
		$project_data = array(
			'updation_datetime'=>date('Y-m-d H:i:s'),
			'updated_by'=>$this->session->userdata('user_id'),
        );
		$this->db->where('id', $pro_id);
        $this->db->update('projects', $project_data); 
	}
	function getTaskList($project_id = FALSE, $date = FALSE) {//important
        $this->db->order_by('datetime', 'DESC');
        $this->db->select('users.id as createrid, users.name as creater_name,uploaded_files.name as filename, task_list.* ');
        if ($project_id) {
			$this->db->join('users', 'users.id = task_list.created_by');
			$this->db->join('uploaded_files', 'uploaded_files.task_list_id = task_list.id','left');
            $this->db->where('task_list.pro_id', $project_id);
        }
        $query = $this->db->get('task_list');
        return $query->result();
    }
    function addTask() {
        $list_id = $this->input->post('list_id');
		$task_desc  = $this->input->post('task_desc');
		$priority = $this->input->post('priority');
        $task_title = $this->input->post('task_title'); //get value from form
		$complettion_date=date('Y-m-d', strtotime(trim($this->input->post('task_comp_time'))))." 00:00:00";
        $assign_to = $this->input->post('ass_users_list'); //get value from form
        $reporting_manager = $this->input->post('reporter_name');
        $createby = $this->session->userdata('user_id'); // get value fron session
        $create_date = date('Y-m-d h:i:s');
        $task_data = array(
            'list_id' => $list_id,
            'text' => $task_title,
			'task_desc'=>$task_desc,
			'priority'=>$priority,
            'created_by' => $createby,
            'datetime' => $create_date,
            'completion_datetime' => $complettion_date
        );
        $this->db->insert('tasks', $task_data); // insert data into tasks table
        $task_id = $this->db->insert_id(); // get current insert id 
        /* insert data into assign task table */
		foreach($assign_to as $user){
			$task_assign = array(
            'user_id' => $user,
			'reporter_id' => $reporting_manager,
            'task_id' => $task_id,
            'assigned_by' => $createby
			);
			$this->db->insert('task_assignment', $task_assign);
		}
        
		$this->db->select('projects.id as p_id, projects.name as p_name, projects.created_datetime,task_list.*');
		$this->db->join('task_list', 'task_list.pro_id = projects.id');
		$this->db->where('task_list.id',$list_id );
		$query = $this->db->get('projects');
		$res= $query->result();	
		$pro_id=$res[0]->p_id;
		/*===added on 17/2/2015===== for project update===*/		
		$project_data = array(
			'updation_datetime'=>date('Y-m-d H:i:s'),
			'updated_by'=>$this->session->userdata('user_id'),
        );
		$this->db->where('id', $pro_id);
        $this->db->update('projects', $project_data);	
		$project_title=$res[0]->p_name;
		$task_list_name=$res[0]->name;
		$query = $this->db->get('users', $assign_to);        
            foreach ($query->result() as $rows) {
                //add all data to session
                $assign_user_data = array(
                    'user_id' => $rows->id,
                    'user_name' => $rows->name,
                    'user_image' => $rows->user_image,
                    'user_email' => $rows->email,
                    'logged_in' => TRUE,
                    'user_type' => $rows->user_type,
                    'status' => $rows->status,
                    'acc_creation_date' => $rows->creation_date,
                    'acc_activation_date' => $rows->activation_date
                );
            }
			$email_html='<a target="_blank" href="http://iamstellen.pw/spmtool/index.php/todo/'.$list_id.'">
						'.$task_title.'
						</a></br>
						Description:
						'.$this->session->userdata('user_name').' assigned you a task on '.$task_list_name.' project '.$project_title.'. ';
										
			$email_setting  = array('mailtype'=>'html');
			$this->email->initialize($email_setting);			
			$this->email->from($this->session->userdata('user_email'));
			$this->email->to($assign_user_data['user_email']);
			$this->email->subject(''.$project_title.': New Task Assigned to you');
			$this->email->message($email_html);
			$this->email->send();
    }
	function getAllTask($list_id = FALSE, $task_id = FALSE) {
		$query =$this->db->select(' tasks.*,task_assignment.*,`tasks`.`datetime` AS `tsk_added_date`, `task_assignment`.`id` AS `tsk_asg_id`,`users`.`id` AS `user_assigned_id`,`users`.`name` AS `user_assigned_name` ');
		$this->db->join('task_assignment','tasks.id = task_assignment.task_id');
		$this->db->join('users','users.id = task_assignment.user_id');
		if ($list_id){
			$this->db->where('tasks.list_id', $list_id);
		}
		if ($task_id) {
			$this->db->where('task_assignment.id', $task_id);
		}
		$this->db->order_by('tasks.datetime', 'DESC');
		$query = $this->db->get('tasks');
		return $query->result();		
    }
	function getTaskDetail($arg2){
	  $this->db->select('projects.id as p_id, projects.name as p_name, projects.created_datetime, task_list.* ');
	  $this->db->where('task_list.id', $arg2);
	  $this->db->join('projects', 'projects.id = task_list.pro_id');
	  $query = $this->db->get('task_list');
	  return $query->result();	
	}
	function taskDetail($arg2){
	  	$this->db->select('projects.id as p_id, projects.name as p_name,task_list.name as task_list_name,task_list.id as task_list_id,tasks.id as tasks_id,tasks.text as tasks_name,tasks.task_desc as task_desc,tasks.completion_datetime as tasks_deadline,task_assignment.task_status as task_complete_status');
		
		$this->db->join('task_assignment', 'task_assignment.task_id = tasks.id');
		$this->db->join('task_list', 'task_list.id = tasks.list_id');
		$this->db->join('projects', 'projects.id = task_list.pro_id');
		$this->db->where('task_assignment.id', $arg2);
		$query = $this->db->get('tasks');
	    return $query->result();
	}
	function changeStatus($arg1,$arg2){
	    $task_data = array(
            'task_status' => $arg2,            
        );
		$this->db->where('id', $arg1);
        $this->db->update('task_assignment', $task_data); 		
	}

    
    

	
	
	
	
	
	
    
	 
   /* function update_todo($arg2){
        
        $status = $_POST['stat'];
            $update_by = $this->session->userdata('user_id'); // get value fron session
            if($status !='Y'){
                $datetime = "null";
            }else{
                $datetime = date('Y-m-d H:i:s');
            }
            
           $data = array(
             'completed' => $datetime,
               'user_id' => $update_by
            ); 
            
            $this->db->where('id', $arg2);
            $this->db->update('task_assignment', $data); 
            
            return $msg ="Update Done";
    }*/	
	function taskAssignDetail($userid){
		
		$this->db->select('projects.id as p_id, projects.name as p_name,task_list.name as task_list_name,task_list.id as task_list_id,tasks.id as tasks_id,tasks.text as tasks_name,tasks.task_desc as task_desc,tasks.priority as taskPriority ,tasks.completion_datetime as tasks_deadline,task_assignment.task_status as task_complete_status');		
		$this->db->join('task_assignment', 'task_assignment.task_id = tasks.id');
		$this->db->join('task_list', 'task_list.id = tasks.list_id');
		$this->db->join('projects', 'projects.id = task_list.pro_id');
		$this->db->where('task_assignment.user_id', $userid);
		$this->db->order_by('sort_order','asc');
		$query = $this->db->get('tasks');
	    return $query->result();
	}
	function updateOrderchange($id,$order_no)
	{
		$data = array(
			'sort_order' => $order_no
        );     
        $this->db->where('id', $id);
        $this->db->update('tasks', $data); 
	}
}