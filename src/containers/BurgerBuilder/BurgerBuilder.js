import React, { Component } from 'react'
import Aux from '../../hoc/Auxillary/Auxillary'
import Burger from '../../components/Burger/Burger'
import BuildControls from '../../components/Burger/BuildControls/BuildControls'
import Modal from '../../components/UI/Modal/Modal'
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary'
import axios from '../../axios-orders'
import Spinner from '../../components/UI/Spinner/Spinner'
import withErrorHandler from  '../../hoc/withErrorHandler/withErrorHandler'
import { connect } from 'react-redux'
import * as actionTypes from '../../store/actions'



class BurgerBuilder extends Component {
    state = {
        purchaseable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {
        // Get our ingredients list dynamically from our database when we
        // mount the burger builder
        // axios.get('/ingredients.json')
        //     .then(response => {
        //         this.setState({ingredients: response.data})
        //     }).catch(error => {
        //         this.setState({error: true})
        //     })
        // console.log("mounted bb")
    }

    updatePurchaseState(ingredients) {
        // Turn ingredients into array to check if we have at least one
        // Then turn into a sum
        const sum = Object.keys(ingredients)
            .map(igKey => {
                return ingredients[igKey]
            }).reduce((sum, el) => {
                return sum + el
            }, 0)

        this.setState({purchaseable: sum > 0})
    }

    // Note we need this to be () =>, not a simple ()
    // This is because a () will cause this to refer to possibly a different class
    purchaseHandler = () => {
        this.setState({purchasing: true})
    }

    // When we click on the backdrop & close the order modal,
    // ensure we set purchasing back to false.
    purchaseCancelHandler = () => {
        this.setState({purchasing: false})
    }

    purchaseContinueHandler = () => {
        
        const queryParams = []
        for (let i in this.props.ings) {
            //Encodes elements such that they can be used in URL
            queryParams.push(encodeURIComponent(i) + '=' 
                + encodeURIComponent(this.props.ings[i]))
        }
        queryParams.push('price=' + this.props.totalPrice)
        const queryString = queryParams.join('&')
        this.props.history.push({
            pathname: '/checkout',
            search: queryString
        })
    }

    render() {
        const disabledInfo = {
            ...this.props.ings,
        }
        
        for (let key in disabledInfo) {
            disabledInfo[key] = (disabledInfo[key] <= 0)
        }

        // Show spinner if sending a request, otherwise order summary
        let orderSummary = null
        if (this.props.ings && !this.state.loading) {
            orderSummary = <OrderSummary 
                        ingredients={this.props.ings}
                        purchaseCanceled={this.purchaseCancelHandler}
                        purchaseContinued={this.purchaseContinueHandler}
                        price={this.props.totalPrice}
                        />
        }
        else if (this.state.loading) {
            orderSummary = <Spinner />
        }

        let burger = this.state.error ? <p>Ingredients can't be loaded</p> : <Spinner />
        // Check that we have fetched ingredients list from
        // DB before trying to display our burger
        if (this.props.ings) {
            burger = <Aux>
                <Burger ingredients={this.props.ings}/>
                <BuildControls 
                    ingredientAdded={this.props.onIngredientAdded}
                    ingredientRemoved={this.props.onIngredientRemoved}
                    disabled={disabledInfo}
                    price={this.props.totalPrice}
                    purchaseable={this.state.purchaseable}
                    ordered={this.purchaseHandler}
                />
                </Aux>
        }

        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        ings: state.ingredients,
        totalPrice: state.totalPrice,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onIngredientAdded: (ingName) => dispatch({type: actionTypes.ADD_INGREDIENT, ingredientName: ingName}),
        onIngredientRemoved: (ingName) => dispatch({type: actionTypes.REMOVE_INGREDIENT, ingredientName: ingName}),
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));