const INPUT_TYPES = /(text|number|date|hidden|password|radio|checkbox|date|color|file)/;
const SELECT_TYPE = /(single|mult)/;

var getAttr = (domE, attr) => {
  if(domE.attributes[attr])
    return domE.attributes[attr].value;
  return "";
}

class LotusInput {
  constructor(element, type){
    if(type.search(INPUT_TYPES) != 0) return false;


    var input = document.createElement('input');
    var renderElement;
    if(type == 'radio'){
      renderElement = document.createElement('label');
      var checkView = document.createElement('div');
      var text = document.createElement('span');

      renderElement.appendChild(input);
      renderElement.appendChild(checkView);
      renderElement.appendChild(text);
      text.innerHTML = element.innerHTML;

      input.setAttribute('type', 'radio');
    }else if(type == 'checkbox'){
      renderElement = document.createElement('label');
      var checkView = document.createElement('div');
      var text = document.createElement('span');
      var no_value = document.createElement('input');

      renderElement.appendChild(input);
      renderElement.appendChild(no_value);
      renderElement.appendChild(checkView);
      renderElement.appendChild(text);
      text.innerHTML = element.innerHTML;

      input.setAttribute('type', 'checkbox');
      no_value.setAttribute('type', 'hidden');
    }else if(type.search(/(text|number|date|password|email|color|file)/) == 0){
      renderElement = document.createElement('div');
    }

    this.origin = element;
    this.type = type;
    this.input = input;
    this.renderElement = renderElement;

    this.configure();
    this.applyEvents();
  }

  configure(){
    $(this.origin).removeClass('cyax');
    this.renderElement.setAttribute('type', getAttr(this.origin, 'type'));
    this.input.setAttribute('id', getAttr(this.origin, 'id'));
    this.input.setAttribute('name', getAttr(this.origin, 'name'));
    this.input.setAttribute('class', getAttr(this.origin, 'class'));
    this.input.setAttribute('value', getAttr(this.origin, 'value'));

    if(this.type == "number"){
      this.input.setAttribute('type', getAttr(this.origin, 'text'));
    }else{
      this.input.setAttribute('type', getAttr(this.origin, 'type'));
    }

    if(this.type === 'radio'){
      this.renderElement.children[1].className = 'fontawesome-circle';
      if(this.origin.dataset['style']){
        this.renderElement.children[1].className += ' '+this.origin.dataset['style'];
      }
      this.renderElement.className = 'radio';
    }else if(this.type === 'checkbox'){
      if(this.origin.dataset['style']){
        this.renderElement.children[2].className += ' '+this.origin.dataset['style'];
      }
      this.renderElement.className = 'checkbox';

      var hidden = this.renderElement.children[1];
      hidden.setAttribute('name', getAttr(this.origin, 'name'));
      hidden.setAttribute('value', getAttr(this.origin, 'value'));
    }else if(this.type.search(/(text|number|date|password|email|color|file)/) == 0){
      var label = document.createElement('label');
      var text = document.createElement('span');

      var div_input = document.createElement('div');
      var file_label = document.createElement('label');

      text.innerHTML = this.origin.innerHTML;

      label.setAttribute('for', getAttr(this.origin,'id'));
      file_label.setAttribute('for', getAttr(this.origin,'id'));
      this.renderElement.className = "input-group";

      if(this.origin.innerHTML !== "")
        label.appendChild(text);
      div_input.appendChild(file_label);
      div_input.appendChild(this.input);

      if(this.type == 'file'){
        file_label.innerHTML = this.origin.dataset['placeholder'] || 'Choose file';
        text.className = 'input-group-text';
        div_input.className = 'custom-file';
        file_label.className = 'custom-file-label';
      }else{
        text.className = 'input-group-text';
        div_input.className = 'custom-file';
        file_label.className = 'custom-file-label';
        this.input.className += ' form-control';
      }

      if (this.origin.dataset['order'] == 'prepend'){
        this.renderElement.appendChild(label);
        if(this.type == 'file')
          this.renderElement.appendChild(div_input);
        else
          this.renderElement.appendChild(this.input);

        label.className = 'input-group-prepend';
      }else{
        if(this.type == 'file')
          this.renderElement.appendChild(div_input);
        else
          this.renderElement.appendChild(this.input);
        this.renderElement.appendChild(label);

        label.className = 'input-group-append';
      }
      if(this.type.search(/(text|number|password|date|email)/) == 0){
        var min = this.origin.dataset["min"];
        var max = this.origin.dataset["max"];

        if(min) this.input.setAttribute('minlength', min);
        if(max) this.input.setAttribute('maxlength', max);
      }
    }
  }

  applyEvents(){
    if(this.type == 'checkbox'){
      $(this.input).change((evt)=>{
        var checkInput = evt.target;
        if(checkInput.checked)
          $(checkInput).closest('.checkbox').addClass('checked');
        else
          $(checkInput).closest('.checkbox').removeClass('checked');
      });
    }else if(this.type == 'radio'){
      $(this.input).change((evt)=>{
        var radioInput = evt.target;
        $('input[type="radio"][name="'+getAttr(radioInput,"name")+'"]').closest('.radio').removeClass('checked');
        $(radioInput).closest('.radio').addClass('checked');
      });
    }else if(this.type == "number"){
      $(this.input).keypress((evt)=>{
        var exp_number = /[0-9\-.,%:$R=]/;
        if(this.origin.dataset["regex"])
          exp_number = new RegExp(this.origin.dataset["regex"]);
        if(evt.key.search(exp_number))
          evt.preventDefault();
      });
      this.input.setAttribute('type', getAttr(this.origin, 'text'));
    }
  }

  replace(){
    $(this.origin).replaceWith(this.renderElement);
  }

  static render(){
    $('div.input').each((index, div)=>{
      var type = getAttr(div,'type');

      var input = new LotusInput(div, type);
      input.replace();
    });
  }
}

class LotusSelect {
  constructor(element, type){
    if(type == "") type == "single";
    if(type.search(SELECT_TYPE) != 0) return false;

    var renderElement = document.createElement('div');
    var label = document.createElement('div');
    var optionList = document.createElement('div');
    for(var index=0; index<element.children.length; index+=1){
      var option = element.children[index];
      if(getAttr(option,'class') == "select-label"){
        var labelText = document.createElement('label');
        var labelSelected = document.createElement('input');
        var spanText = document.createElement('span');

        labelText.setAttribute('class', 'input-group-'+(element.dataset['order'] != 'append' ? 'prepend' : 'append'));
        labelText.setAttribute('for', getAttr(element, 'id')+'-input');
        labelSelected.setAttribute('class','input form-control');
        labelSelected.setAttribute('id',getAttr(element, 'id')+'-input');
        spanText.setAttribute('class', 'input-group-text');

        if(element.dataset['order'] == 'append'){
          label.appendChild(labelSelected);
          label.appendChild(labelText);
        }else{
          label.appendChild(labelText);
          label.appendChild(labelSelected);
        }
        labelText.appendChild(spanText);
        if(option.innerHTML.trim() == ''){
          // spanText.className+= ' fontawesome-chevron-down';
          spanText.innerHTML = '<span class="fontawesome-chevron-down"></span>';
        }
        else
          spanText.innerHTML = option.innerHTML;
        continue;
      }
      var newOption = document.createElement('div');
      newOption.className = 'input';
      if (type == "single"){
        newOption.setAttribute('name', getAttr(element, 'name'));
      }else{
        newOption.setAttribute('name', getAttr(element, 'name')+'[]');
      }
      newOption.setAttribute('type', type == "single" ? 'radio' : 'checkbox');
      newOption.setAttribute('value', getAttr(option, 'value'));
      newOption.setAttribute('id', getAttr(element, 'name')+"-"+getAttr(option, 'value'));
      newOption.innerHTML = option.innerHTML;

      optionList.appendChild(newOption);
    }

    renderElement.appendChild(label);
    renderElement.appendChild(optionList);

    label.className = 'select-label pr-1 input-group';
    optionList.className = 'select-list';
    renderElement.className = element.className;

    renderElement.setAttribute('type', type);
    renderElement.setAttribute('id', getAttr(element,'id'));

    this.origin = element;
    this.renderElement = renderElement;
    this.type = type
  }

  applyEvents(){
    var element = $(this.renderElement);

    $(element).find('.select-label > .input').focus((evt)=>{
      var interval = setInterval(()=>{
        $(this.renderElement).addClass('open');
        $(this.renderElement).find('.select-list')[0].setAttribute('style', 'width: '+$(this.renderElement).width()+'px;');
        clearInterval(interval);
      }, 200);
    });

    $(element).find('.select-label > .input').blur((evt)=>{
      var interval = setInterval(()=>{
        $(this.renderElement).removeClass('open');
        clearInterval(interval);
      }, 200);
    });

    $(element).find('.select-label > .input').keypress((evt)=>{
      evt.preventDefault();
    });

    element.find('input[type=checkbox]').change((evt)=>{
      // $(evt.target).closest('.select').removeClass('open');
      $(element).find('.select-label > .input').val($(evt.target).closest('.select').find('.checked > span').html());
      $(element).find('.select-label > .input').focus();
    });

    element.find('input[type=radio]').change((evt)=>{
      $(evt.target).closest('.select').removeClass('open');
      $(element).find('.select-label > .input').val($(evt.target).closest('.select').find('.checked > span').html());
    });
  }

  replace(){
    $(this.origin).replaceWith(this.renderElement);
  }

  static render(){
    $('div.select').each((index, div)=>{
      var type = getAttr(div, 'type');

      var select = new LotusSelect(div, type);
      select.replace();
      LotusInput.render();
      select.applyEvents();
    });
  }

}


$(document).ready(()=>{
  LotusInput.render();
  LotusSelect.render();
});
