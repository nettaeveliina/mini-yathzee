import React, { useState, useEffect } from "react";
import { Text, View, TouchableHighlight } from "react-native";
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Container, Row, Col } from "react-native-flex-grid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from '../Style/style';

import { MAX_SPOT, NBR_OF_THROWS, NBR_OF_DICES, SCOREBOARD_KEY } from "../constants/Game";

let board = [];

const Gameboard = ({ navigation, route }) => {
    const [playerName, setPlayerName] = useState('');
    const [currentRound, setCurrentRound] = useState(1);
    const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
    const [status, setStatus] = useState('Throw dices');
    const [gameEndStatus, setGameEndStatus] = useState(false);

    const [selectedDices, setSelectedDices] = useState(new Array(NBR_OF_DICES).fill(false));
    const [diceSpots, setDiceSpots] = useState(new Array(NBR_OF_DICES).fill(0));
    const [selectedDicePoints, setSelectedDicePoints] = useState(new Array(MAX_SPOT).fill(false));
    const [dicePointsTotal, setDicePointsTotal] = useState(new Array(MAX_SPOT).fill(0));
    const [totalPoints, setTotalPoints] = useState(0); 
    const [bonusPoints, setBonusPoints] = useState(0); 
    const [scores, setScores] = useState([]);
    const [message, setMessage] = useState(''); 

    useEffect(() => {
        if (playerName === '' && route.params?.player) {
            setPlayerName(route.params.player);
        }
    }, [playerName, route.params]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getScoreboardData();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (totalPoints >= 63) {
            setBonusPoints(50);
            setMessage('Congratulations! Bonus points (50) added.');
        } else {
            setBonusPoints(0);
            setMessage('');
        }
    }, [totalPoints]);

    useEffect(() => {
        const pointsNeededForBonus = 63;
        const pointsDifference = pointsNeededForBonus - totalPoints;

        if (pointsDifference <= 0) {
            setBonusPoints(50);
            setMessage('Congratulations! Bonus points (50) added.');
        } else {
            setMessage(`You are ${pointsDifference} points away from bonus.`);
        }
    }, [totalPoints]);

    useEffect(() => {
        if (totalPoints >= 63 && bonusPoints === 0) {
            setBonusPoints(50);
            setTotalPoints((prevTotal) => prevTotal + 50);
            setMessage('Congratulations! Bonus points (50) added.');
        }
    }, [totalPoints, bonusPoints]);

    const dicesRow = [];
    for (let dice = 0; dice < NBR_OF_DICES; dice++) {
        dicesRow.push(
            <Col key={"dice" + dice}>
                <TouchableHighlight
                    style={styles.diceContainer}
                    underlayColor="transparent"
                    onPress={() => selectDice(dice)}
                >
                    <MaterialCommunityIcons
                        name={board[dice] || "dice-1"}
                        size={50}
                        color={getDiceColor(dice)}
                    />
                </TouchableHighlight>
            </Col>
        );
    }

    const pointsToSelectRow = [];
    for (let diceButton = 0; diceButton < MAX_SPOT; diceButton++) {
        pointsToSelectRow.push(
            <Col key={"buttonsRow" + diceButton}>
                <TouchableHighlight
                    style={styles.diceContainer}
                    underlayColor="transparent"
                    onPress={() => selectDicePoints(diceButton)}
                >
                    <MaterialCommunityIcons
                        name={"numeric-" + (diceButton + 1) + "-circle"}
                        size={35}
                        color={getDicePointsColor(diceButton)}
                    />
                </TouchableHighlight>
            </Col>
        );
    }

    const selectDicePoints = (i) => {
        if (nbrOfThrowsLeft === 0) {
            let selectedPoints = [...selectedDicePoints];
            let points = [...dicePointsTotal];
            if (!selectedPoints[i]) {
                selectedPoints[i] = true;
                let nbrOfDices =
                    diceSpots.reduce(
                        (total, x) => (x === (i + 1) ? total + 1 : total), 0);
                points[i] = nbrOfDices * (i + 1);
                setDicePointsTotal(points);
                setSelectedDicePoints(selectedPoints);
                setTotalPoints((prevTotal) => prevTotal + points[i]); 

                
                if (selectedDicePoints.every((value) => value === true)) {
                    setGameEndStatus(true);
                    setStatus("All points have been selected.");
                    setTimeout(() => {
                        startNewRound();
                    }, 3000); 
                }
            } else {
                setStatus('You already selected points for ' + (i + 1));
                return points[i];
            }
        } else {
            setStatus('Throw ' + NBR_OF_THROWS + ' times before setting points');
        }
    };

    const savePlayerPoints = async () => {
        const newKey = scores.length + 1;
        const currentDate = new Date();

        const playerPoints = {
            key: newKey,
            name: playerName,
            date: currentDate.toLocaleDateString(),
            time: currentDate.toLocaleTimeString(),
            points: totalPoints,
        };

        try {
            const newScore = [...scores, playerPoints];
            const jsonValue = JSON.stringify(newScore);
            await AsyncStorage.setItem(SCOREBOARD_KEY, jsonValue);
            console.log('Points saved successfully');
        } catch (e) {
            console.log('Save error: ' + e);
        }
    }

    const getScoreboardData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
            if (jsonValue !== null) {
                let tmpScores = JSON.parse(jsonValue);
                setScores(tmpScores);
            }
        }
        catch (e) {
            console.log('Read error: ' + e)
        }
    }

    const pointsRow = [];
    for (let spot = 0; spot < MAX_SPOT; spot++) {
        pointsRow.push(
            <Col key={"pointsRow" + spot}>
                <Text key={"pointsRow" + spot}>{getSpotTotal(spot)}</Text>
            </Col>
        );
    }

    const throwDices = () => {
        if (nbrOfThrowsLeft > 0) {
            let spots = [...diceSpots];
            for (let i = 0; i < NBR_OF_DICES; i++) {
                if (!selectedDices[i]) {
                    let randomNumber = Math.floor(Math.random() * 6 + 1);
                    board[i] = 'dice-' + randomNumber;
                    spots[i] = randomNumber;
                }
            }
            setNbrOfThrowsLeft(nbrOfThrowsLeft - 1);
            setDiceSpots(spots);
            setStatus(nbrOfThrowsLeft > 0 ? `Select and throw dices` : 'Select points or throw again');
        } else {
            if (currentRound < 6) {
                setCurrentRound(currentRound + 1); 
                setGameEndStatus(false); 
                setSelectedDices(new Array(NBR_OF_DICES).fill(false)); 
                setDiceSpots(new Array(NBR_OF_DICES).fill(0)); 
                setNbrOfThrowsLeft(NBR_OF_THROWS); 
                setStatus(`Select and throw dices for the new round.`);
            } else {
                setStatus('Game has ended. Save your points and move to the scroreboard.');
                setGameEndStatus(true);
            }
        }
    }
    
    function getSpotTotal(i) {
        return dicePointsTotal[i];
    }

    const selectDice = (i) => {
        if (nbrOfThrowsLeft < NBR_OF_THROWS && !gameEndStatus) {
            let dices = [...selectedDices];
            dices[i] = !selectedDices[i];
            setSelectedDices(dices);
        } else {
            setStatus("You have to throw dices first.");
        }
    }

    function getDiceColor(i) {
        return selectedDices[i] ? "peachpuff" : "white";
    }

    function getDicePointsColor(i) {
        return (selectedDicePoints[i] && !gameEndStatus) ? "peachpuff" : "white";
    }

    const startNewRound = () => {
        setNbrOfThrowsLeft(NBR_OF_THROWS);
        setSelectedDices(new Array(NBR_OF_DICES).fill(false)); 
        setDiceSpots(new Array(NBR_OF_DICES).fill(0)); 
        setDicePointsTotal(new Array(MAX_SPOT).fill(0)); 
        setStatus("Throw dices for the new round.");
    }

    const renderButton = (text, onPress) => (
        <TouchableHighlight
            style={styles.throwButton}
            onPress={onPress}
            underlayColor="lightgrey" 
        >
            <Text style={styles.throwButtonText}>{text}</Text>
        </TouchableHighlight>
    );

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.homeContainer}>
                <Container fluid>
                    <Row>{dicesRow}</Row>
                </Container>
                <Text style={styles.status}>Round: {currentRound}</Text>
                <Text style={styles.status}>Throws left: {nbrOfThrowsLeft}</Text>
                <Text style={styles.status}>{status}</Text>
                {renderButton('THROW DICES', () => throwDices())}
               
                <Container fluid>
                    <Row>{pointsRow}</Row>
                </Container>
                <Container fluid>
                    <Row>{pointsToSelectRow}</Row>
                </Container>
                <Text style={styles.totalPoints}>Total Points: {totalPoints}</Text>
                <Text style={styles.bonusPoints}>
                    {message} 
                </Text>
                {renderButton('SAVE POINTS', () => savePlayerPoints())}
                <Text style={styles.status}>Player: {playerName}</Text>
            </View>
            <Footer />
        </View>
    );
}

export default Gameboard;
