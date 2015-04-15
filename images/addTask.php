
<script>
     $(function() {
       $( "#task_comp_time" ).datepicker({ dateFormat: 'dd-mm-yy' });
     });
</script>
<?php
$attributes = array('name' => 'frmAll', 'id' => 'frmAll', 'method' => 'POST', 'class' => 'form-horizontal');
echo form_open('todo/add/' . $this->uri->segment('2'), $attributes);
?>

<input type="hidden" name="list_id" id="list_id" value="<?php echo $list_id; ?>"/>

<h4>ADD TASK</h4>

<div class="form-group">


   <div class="col-lg-8">

        <?php echo form_error('task_title ', '<div class = "error"> ', "</div>"); ?>
<?php echo form_label('Tiltle: ', 'Task_Tiltle'); ?>

        <?php
        echo form_input(array('name' => 'task_title', 'id' => 'task_title', 'value' => set_value('task_title'), 'class' => 'form-control', 'placeholder' => 'Enter Task', 'required' => true, 'ng-model' => "task_title"));
        ?>
        <span style="color:red" ng-show="frmAll.task_title.$dirty && frmAll.task_title.$invalid">
            <span ng-show="frmAll.task_title.$error.required">Title is required.</span>
        </span>

    </div>

</div>
<div class="form-group">


   <div class="col-lg-8">

        <?php echo form_error('task_desc ', '<div class = "error"> ', "</div>"); ?>
<?php echo form_label('Description: ', 'Task_Description'); ?>

        <?php
        echo form_textarea(array('name' => 'task_desc', 'id' => 'task_desc', 'value' => set_value('task_desc'), 'class' => 'form-control', 'placeholder' => 'Enter Task Description', 'required' => true, 'ng-model' => "task_desc"));
        ?>
        <span style="color:red" ng-show="frmAll.task_desc.$dirty && frmAll.task_desc.$invalid">
            <span ng-show="frmAll.task_desc.$error.required">Title is required.</span>
        </span>

    </div>

</div>

<div class="form-group">


<div class="col-lg-3">
        <?php echo form_error('task_comp_time ', '<div class = "error"> ', "</div>"); ?>

<?php echo form_label('Complition Time: ', 'Task_Complition_Time'); ?>

        <?php
        echo form_input(array('name' => 'task_comp_time', 'id' => 'task_comp_time', 'value' => set_value('task_comp_time'), 'class' => 'form-control', 'placeholder' => 'Completion Time', 'ng-model' => "task_comp_time"));
        ?>
    </div>
	<div class="col-lg-3">
	       <?php echo form_label('Priority: ', 'Priority'); ?>
			<select name="priority" id="priority"class="form-control" required>
			<option value="urgent">Urgent</option>
			<option value="high">High</option>
			<option value="medium">Medium</option>
			<option value="low">Low</option>
		  </select>  

	</div>
	<div class="col-lg-3">
		<?php echo form_label('Reporting User: ', 'reporting_user'); ?>
        <select name="reporter_name" id="reporter_name"class="form-control" >
		<?php  foreach($reporter_list as $reporter){?>
		<option value="<?php echo $reporter['id'] ?>"><?php echo $reporter['name']." (".$reporter['email'].")"; ?></option>
		<?php }?>
	  </select>  

    </div>
</div>
<div class="form-group">
	<div class="col-lg-3">	
		<?php foreach($options as $user){?>
			<input type="checkbox" name="ass_users_list[]" value="<?php echo $user['id'];?>"><?php echo $user['name']."(".$user['email'].")";?></br>
		<?php } ?>

    </div>
</div>
<div class="form-group">

    <div class="col-lg-3">
        <?php
        echo form_submit(array('name' => 'cmdsubmit', 'class' => "btn btn-primary"), 'Save'), '&nbsp;&nbsp;';

        echo form_reset('reset', 'Reset', 'class = "btn btn-danger"');
        ?> 
    </div>
</div>


</form>



