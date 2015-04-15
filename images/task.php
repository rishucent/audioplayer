<?php
class Task extends CI_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('task_model');
        $this->load->model('log_model');
        $this->load->model('discussion_model');
        $this->load->model('user_model');
    }
    public function index($arg1 = FALSE, $arg2 = FALSE) {
        if (is_numeric($arg1)) {
            $this->show_list($arg1);
        } else {
            switch ($arg1) {
                case 'add':
                    $this->add($arg2);
                    break;
				case 'changeStatus':
				$this->changeStatus($arg2);
				break;
                case 'add_list':
                    $this->add_list($arg2);
                    break;					
				case 'done_todo':
                    $this->done_todo($arg2);
                    break;
                case'detail':
                    $this->detail($arg2);
                    break;
				case'userAssign':
                    $this->userAssign($arg2);
                    break;
            }
        }
        $this->template->render();
    }
	public function addTaskList($arg2) {
		if(isset($_POST)){		
			if(isset($_FILES["files"])){			
				$allowedExts = array("pdf","doc","docx","jpg","png","gif","txt"); 
				$allowedMimeTypes = array('application/msword','text/pdf','image/gif','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/pdf');
				$extension = end(explode(".", $_FILES["files"]["name"]));
				$temp = explode(".",$_FILES["files"]["name"]);
				$newfilename = $temp[0].rand(1,99999) . '.' .$extension;
				if ( 20000000 < $_FILES["files"]["size"]  ) {
					echo  'Please provide a smaller file [E/1].';
				}
				if ( ! ( in_array($extension, $allowedExts ) ) ) {
					echo  'Please provide another file type [E/2].';
				}
				if ( in_array( $_FILES["files"]["type"], $allowedMimeTypes ) ) 
				{      
					move_uploaded_file($_FILES["files"]["tmp_name"], "upload/" . $newfilename);
					$pro_id=$arg2;
					$title=$_POST['title'];			
					$filename=$newfilename;
					$this->task_model->addTaskList($pro_id,$title,$filename);
					echo  'true';
				}
				else
				{
					echo  'Please provide another file type [E/3].';
				}	
			}else{
				$newfilename='';
				$pro_id=$arg2;
				$title=$_POST['title'];			
				$filename=$newfilename;
				$this->task_model->addTaskList($pro_id,$title,$filename);
				echo  'true';
			}			
		}		
    }
    public function add($arg2) {
        if (isset($_POST)) {     
            $this->task_model->addTask();
        }
        redirect(site_url('todo/' . $this->uri->segment('3')));
    }
	function changeStatus($task_id){
	 if (isset($_POST)) {  
            $this->task_model->changeStatus($task_id,$_POST['task_Status']);
			redirect(site_url('todo/detail/' . $this->uri->segment('3')));
        }    
	}   
    function show_list($arg1) {
        $data['tasks'] = $this->task_model->getAllTask($arg1);    
		$users = $this->user_model->getAssignUserList($arg1);
		$reporting_users = $this->user_model->getReportingUsers($arg1);
	    $data['selected_task'] = $this->task_model->getTaskDetail($arg1);
	    $data['reporter_list'] = $reporting_users;
        $data['reporters'] = array();
	    foreach ($reporting_users as $value) {
            $data['reporters'][$value['id']] = $value['name'] . ' (' . $value['email'] . ' )';
        }
	    $data['options'] = array();
		$data['options']=$users;
		$sel=$data['selected_task'];		
        $this->template->write('page_title', $sel[0]->p_name);
		$this->template->write('project_id', $sel[0]->p_id);
		$this->template->write('task_id', $sel[0]->id);
		$this->template->write('task_name', $sel[0]->name);
        $data['list_id'] = $arg1;         
	    $this->template->write_view('content', 'task/showAllTask', $data);
		$this->template->write_view('content', 'task/addTask', $data);
	}
    function detail($arg2) {
        $data['tasks'] = $this->task_model->getAllTask(FALSE, $arg2);		
		$data['full_task_detail']=$this->task_model->taskDetail($arg2);     
		$data['list_id'] = $arg2;
        $data['query'] = $this->discussion_model->getAllDiscussion();
        $this->template->write_view('content', 'task/taskDetail', $data);
        $this->template->write_view('content', 'discussion/showDiscussion', $data);
    }
	function userAssign($userid){	/*get all task for particular user*/
		$data['userAssign']=$this->task_model->taskAssignDetail($userid);
		//print_r($data['userAssign']);die;
		$this->template->write_view('content', 'task/userAssign', $data);
		$this->template->render();
	}
	function order_change()
	{
		$orders = explode('&', $_POST['orders']);
		$array = array();
	    foreach($orders as $item) {
			$item = explode('=', $item);
			if($item[1])
			{
				$items = explode('_', $item[1]);
				$array[] = $items[1];
			}
		}
		$order_no=1;
		foreach($array as $arr)
		{
		    $this->task_model->updateOrderchange($arr,$order_no);	
            $order_no++;		
		}
		die;
	}
	/*function done_todo($arg2){        
        $this->task_model->update_todo($arg2);		
    }*/
}