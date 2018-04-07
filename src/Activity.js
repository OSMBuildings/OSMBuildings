
// TODO: could turn into a public loading handler
// OSMB.loader - stop(), start(), isBusy(), events..

Activity = class {

  constructor () {
    this.jobs = [];
  }

  setBusy(id){
    if(id !== undefined){
      this.jobs.push(id);
    }
  }

  setIdle(id){
    if(id !== undefined) {
      this.jobs = this.jobs.filter(job => job !== id);
    }
  }

  isBusy(){
    return this.jobs.length;
  }

  destroy(){
    this.jobs = [];
  }

}
