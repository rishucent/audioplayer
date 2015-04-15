<?php
$attributes = array('name' => 'add_task_list', 'id' => 'frmAll', 'method' => 'POST','enctype'=>'multipart/form-data' ,'class' => 'form-horizontal');
echo form_open(site_url('task/add'), $attributes);
?>
	<div class="form-group">
		<?php echo form_error('title ', '<div class = "error"> ', "</div>"); ?>
		<div class="col-lg-4">
			<?php echo form_input(array('name' => 'title', 'id' => 'title', 'value' => set_value('title'), 'class' => 'form-control', 'placeholder' => 'Task List Title', 'required' => 'true'));?>
		</div>
		<div class="col-lg-4">
			<label for="file">Filename:</label>
			<input type="file" name="file" id="file">
		</div>
		<div class="col-lg-4">
			<?php
			echo form_submit(array('name' => 'cmdsubmit', 'class' => "btn btn-primary", 'onclick' => 'return funcValidate(event);'), 'Save'), '&nbsp;&nbsp;';
			echo form_reset('reset', 'Reset', 'class = "btn btn-danger"');
			?>  
		</div>
	</div>
	<input type="hidden" name="pro_id" id="pro_id" value="<?php echo $this->uri->segment(3); ?>" />
</form>
<script type="text/javascript" language="javascript">
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
    function funcValidate(e) {
		e.preventDefault();
        error = 0;
        if (document.getElementById('title').value.trim() == '') {
            var element = document.getElementById("title");
            element.classList.add("error_small");
            error = 1;
        } 
		if (error) {
        } else {		
			var fd = new FormData();
			fd.append('title',document.getElementById('title').value);
			fd.append('files',document.getElementById('file').files[0]);
            $.ajax({
                type: "POST",
                data: fd,
                url: "<?php echo site_url('task/addTaskList'); ?>/" + document.getElementById('pro_id').value,
				processData: false,
				contentType: false,
                success: function(result){
					if(result=='true'){
						alert('Task added successfully');
						location.reload();
					}else{
						alert(result);
					}
                   
                }
            });
        }
		return false;
    }
</script>