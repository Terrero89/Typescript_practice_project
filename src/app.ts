class ProjectState {
private listeners: any[] = []
  private projects: any[] = [];
private static instance: ProjectState

private constructor() {}

static getInstance(){
  if(this.instance ){
    return this.instance;

  }
  this.instance = new ProjectState()
  return this.instance
}

addListener(listenerFn: Function){
  this.listeners.push(listenerFn)
}

//property to add an object with the new project
addProject(title:string, description:string, numOfPeople:number){
  const newProject = {
    id:Math.random().toString(),
    title: title,
    description: description,
    people: numOfPeople,
  }

  this.projects.push(newProject);
  for(const listenerFn of this.listeners){
    listenerFn(this.projects.slice()) //sliced to retur a new array and not mutating the original
  }

}
}

const projectState = ProjectState.getInstance()

//validation
//?interface that validates the inputs from  the form
interface Validatable{
value: string | number;
required?: boolean;
minLength?: number;
maxLength?: number;
min?:number;
max?:number;
}
//function that checks if any of the conditions from validatable
//is false.
function validate(validatableInput:Validatable){
let isValid = true;
if(validatableInput.required){
  //?typeguard
  // if(typeof(validatableInput.value === 'string')) or...
  isValid = isValid && 
  validatableInput.value.toString().trim().length !== 0;
}
//check for the min leng
if(validatableInput.minLength != null && 
  validatableInput.value === 'string'){
isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
}

//?max length 
if(validatableInput.maxLength != null && 
  validatableInput.value === 'string'){
isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
}

//?checks for the the input is greater than min value
if(validatableInput.min != null && typeof validatableInput.value === 'number'){
  isValid = isValid && validatableInput.value >= validatableInput.min;
}
//?checks for the the input is less than max value
if(validatableInput.max != null && typeof validatableInput.value=== 'number'){
  isValid = isValid && validatableInput.value <= validatableInput.max;
}
return isValid;
}


//? AUTOBIND DECORATOR
function autobind(
  // arguments need to be there
  _:any, 
  _2: string,
  descriptor:PropertyDescriptor
  ){
  
const originalMethod = descriptor.value;
const adjDescriptor: PropertyDescriptor = {
  configurable:true,
  get(){
    const boundFn = originalMethod.bind(this)
    return boundFn;
  }
};
return adjDescriptor
}

//?WILL RENDER THE LIST OF PROJECTS
class ProjectList{ 
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[] =[];

 constructor(private type:'active' | 'finished') {
  this.templateElement = document.getElementById(
    'project-list'
  )! as HTMLTemplateElement;
  this.hostElement = document.getElementById('app')! as HTMLDivElement;
  this.assignedProjects = [];

  const importedNode = document.importNode(
    this.templateElement.content,
    true
  );
  this.element = importedNode.firstElementChild as HTMLElement;
  this.element.id = `${this.type}-projects`; //dynamically taking type to use it as an id
  
  projectState.addListener((projects:any[]) =>{
    this.assignedProjects = projects;
    this.renderProjects(); 
  });//to register the changes when this is called, function with param is returned

  this.attach();
  this.renderContent();
 }

 private renderContent(){
  const listId = `${this.type}-projects-list`
  this.element.querySelector('ul')!.id = listId //add list id tp the ul in the dom
 this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
 }
 private attach() {
  this.hostElement.insertAdjacentElement('beforeend', this.element);
}

private renderProjects(){
const listEl = document.getElementById( `${this.type}-projects-list`)! as HTMLElement;
for(const prjItem of this.assignedProjects){
 const listItem = document.createElement('li');
 listItem.textContent = prjItem.title;
  listEl.appendChild(listItem)
}
}
}

//? PROJECT INPUT CLASS
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();//called here because is private
    this.attach();//called here because is private
  }

//tuples to return x # or type elements
//is better to return void than null or other type
  private gatherUserInput(): [string,string,number] | void{
    //get enter title
    const enteredTitle = this.titleInputElement.value
    const enteredDescription = this.descriptionInputElement.value
    const enteredPeople = this.peopleInputElement.value

//?validates the title input
    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    }

    //?validates the description input
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5, 
    }

      //?validates the people input
      const peopleValidatable: Validatable = {
        value: enteredPeople,
        required: true,
        minLength: 1,
        max: 5,
      };


    if(
      !validate(titleValidatable)||
!validate(descriptionValidatable) ||
!validate(peopleValidatable)
     ){
alert("Invalid Input")
return;
     } 
     else{
      return [enteredTitle,enteredDescription,+enteredPeople]
     }
    }
@autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    //to check if it is a  tuple
    if(Array.isArray(userInput)){
        const [title,desc,people] = userInput;
        projectState.addProject(title,desc,people)
        console.log(title,desc,people)
        this.clearInput() // clearing input
    }
    // console.log(this.titleInputElement.value);
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler.bind(this));
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
  //clearing inputs after submit
  private clearInput(){
    this.titleInputElement.value = ""
    this.descriptionInputElement.value = ""
    this.peopleInputElement.value = ""
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active')// the argument is the the type: 'active | 'finished
const finishedPrjList = new ProjectList('finished')