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
  private gatherUserInput(): [string,string,number] | void{
    //get enter title
    const enteredTitle = this.titleInputElement.value
    const enteredDescription = this.descriptionInputElement.value
    const enteredPeople = this.peopleInputElement.value

    if(
      enteredTitle.trim().length === 0 ||
     enteredDescription.trim().length === 0 ||  
     enteredPeople.trim().length === 0
     ){
alert("INVALID INPUT")
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
        const [title,description,people] = userInput
        console.log(title,description,people)
    }
    // console.log(this.titleInputElement.value);
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler.bind(this));
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();