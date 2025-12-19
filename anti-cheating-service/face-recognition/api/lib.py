import warnings
warnings.filterwarnings("ignore")

import torch
from pathlib import Path

import cv2
import time
import pickle
import argparse
import os, sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import numpy as np
import pandas as pd
from PIL import Image
import mediapipe as mp
# from mtcnn.mtcnn import MTCNN
# from keras_facenet import FaceNet
# from keras.models import load_model
from sklearn.preprocessing import Normalizer, LabelEncoder
from typing import Optional, Tuple, Dict, List
