"use strict";

const { cloneDeep } = require("lodash");

class ApiFeatures {
    findQuery;
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
        this.findQuery = this.#makeQuery();
    }

    #makeQuery = () => {
        const clonedQuery = cloneDeep(this.queryString);
        const excludedFields = [ 'page', 'limit', 'sort', 'fields' ];
        excludedFields.forEach(el => delete clonedQuery[el]);
        let queryStr = JSON.stringify(clonedQuery);
        queryStr = queryStr.replace(/(gt|gte|lt|lte)/g, match => `$${match}`);
        queryStr = JSON.parse(queryStr);

        return queryStr;
    }

    filter() {
        this.query = this.query.find(this.findQuery);
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10000;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    sort() {
        if(this.queryString.sory) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('createdAt');
        }

        return this;
    }

    fields() {
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

}

module.exports = ApiFeatures;