// TODO: Grid
Vue.component('grid', {
    props: {
        "ajax-url": {
            type: String,
            required: true
        },
        "order-by-col": String
    },
    template: `
      <div class="col-md-12">
        <div class="row filters">
          <div class="col-md-12">
            <div class="form-inline">
              <div class="form-group">
                <label for="exampleInputName2">Records per page</label>
                <select class="form-control" v-model="pageSize">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div class="form-group pull-right">
                <label for="exampleInputEmail2">Search</label>
                <input type="search" class="form-control" placeholder="Search here" v-model="searchKey">
              </div>
            </div>
          </div>
        </div>
        <div class="row tbl-box">
          <div class="col-md-12">
            <table class="table table-bordered table-condensed table-hover">
              <thead><tr><slot></slot></tr></thead>
              <tbody>
                  <tr v-for="row in gridUpdatedData"><td v-for="column in columns"> {{ row[column.name] }} </td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <nav aria-label="Page navigation" class="pull-right">
              <ul class="pagination">
                <li :class="{ disabled:  previousBtn}">
                  <a href="#" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                    Prev
                  </a>
                </li>
                <li v-for="n in pageCount" :class="{ active: currentPage == n }" @click="gotoPage(n)"><a href="#">{{n}}</a></li>
                <!-- <li><a href="#">...</a></li> -->
                <li :class="{ disabled:  previousBtn}">
                  <a href="#" aria-label="Next">
                    Next
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    `,
    data() {
        return {
            columns: [],
            gridData: [],
            orderedBy: "",
            sortDir: "",
            pageSize: 10,
            searchKey: "",
            maxPagenation: 6,
            currentPage: 1
        };
    },
    computed: {
      pageCount() {
        var dataLength = this.gridData.length;
        var pagesize = this.pageSize;
        return Math.round(dataLength / pagesize, 1);
      },
      previousBtn() {
        return this.currentPage == 1;
      },
      nextBtn() { 
        return this.currentPage == this.pageCount;
      },
      gridUpdatedData() {
        var gridUpdatedData = this.gridData;
        var filterKey = this.searchKey;
        //TODO: Searching
        if (filterKey) {
          gridUpdatedData = gridUpdatedData.filter(function (row) {
              return Object.keys(row).some(function (key) {
                  return String(row[key]).toLowerCase().indexOf(filterKey) > -1;
              });
          });
        }

        // TODO : Sorting
        gridUpdatedData = _.orderBy(gridUpdatedData, [this.orderedBy], [this.sortDir]);

        // TODO: Row Length
        gridUpdatedData = _.slice(gridUpdatedData, 0, this.pageSize);

        return gridUpdatedData;
      }
    },
    created() {
        this.columns = this.$children;
        this.orderedBy = this.orderByCol;
        this.sortDir = "asc";
        this.$http.get(this.ajaxUrl).then(response => {
          this.gridData = response.body;
        }, response => {
          // error callback
          console.log(response.body);
        });

        this.$on('column_ordered', function (column) {  
          this.orderedBy = column.columnname;
          this.sortDir = column.sortdir;
          
          this.columns = _.map(this.columns, function(o) { 
            if (column.columnname != o.name) {
              return _.set(o, 'ordered', false); 
            } else {
              return o;
            }
          });
        });
    },
    methods: {
      gotoPage(page) {
        this.currentPage = page;
      }
    }
});

// TODO: Columns
Vue.component('grid-column', {
    props: {
        name: {
            type: String,
            required: true
        },
        "head-text": {
            type: String,
            default: this.name
        }
    },
    template: `<th @click="order"> {{ headText }} <i :class="glyphiconClass"></i></th>`,
    data() {
        return {
            orderClass: "glyphicon-triangle-bottom",
            ordered: false,
            sortDirection: "asc"
        };
    },
    computed:{
        glyphiconClass() {
          if(this.ordered)
            return "glyphicon pull-right " + this.orderClass;
          else
            return "glyphicon pull-right glyphicon-triangle-bottom";
        }
    },
    methods: {
        order() {
            this.ordered = true;
            if (this.orderClass == "glyphicon-triangle-bottom") {
                this.orderClass = "glyphicon-triangle-top";
                this.sortDirection = "asc";
            } else {
                this.orderClass = "glyphicon-triangle-bottom";
                this.sortDirection = "desc";
            }
            this.$parent.$emit('column_ordered', { columnname: this.name, sortdir: this.sortDirection });
        }
    }
});

var app = new Vue({
   el: '#root',
   data() {
     return {
      namelst: ["karthi","selva","sathis", "sabari"]
     }
   }
});