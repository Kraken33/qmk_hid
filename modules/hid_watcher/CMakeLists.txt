cmake_minimum_required(VERSION 3.28.3 FATAL_ERROR)

project(hid_watcher)

add_executable(hid_watcher main.cpp)

find_package(hidapi REQUIRED)
include(FetchContent)

FetchContent_Declare(json URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz)
FetchContent_MakeAvailable(json)

target_link_libraries(hid_watcher PRIVATE hidapi::hidapi  nlohmann_json::nlohmann_json)