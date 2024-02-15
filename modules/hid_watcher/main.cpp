#include <_types/_uint8_t.h>
#include <nlohmann/json.hpp>
#include "hidapi.h"
#include <unistd.h>
#include <chrono>
#include <fstream>
#include <iostream>
#include <istream>
#include <ostream>
#include <string.h>
#include <string>
#include <sys/_types/_pid_t.h>
#include <thread>

#define DEVICE_C "/Users/vanluv/develop/keybrd/qmk_hid/device.json"

char manufacturer_string[] = "foostan";
char product_string[] = "Corne";

using namespace std;
using namespace std::this_thread; // sleep_for, sleep_until
using namespace std::chrono;      // nanoseconds, system_clock, seconds
using namespace nlohmann;

uint8_t compare_wchar_char(wchar_t *str1, char *str2) {
    uint8_t i = 0;
    while (str1[i] != 00) {
        if ((char)str1[i] != str2[i]) {
            return 0;
        }
        i++;
    }
    
    return 1;
}

hid_device_info *find_keyboard_device(hid_device_info *device) {
    hid_device_info *dev = NULL;
    while (device) {
        if (compare_wchar_char(device->manufacturer_string, manufacturer_string) &&
            compare_wchar_char(device->product_string, product_string) && device->interface_number == 1) {
            dev = device;
            return dev;
        }
        device = device->next;
        cout << device->vendor_id << endl;
    }
    
    return dev;
}

void write_metadata(json data) {
    ofstream json_config;
    json_config.open(DEVICE_C);
    if (json_config.is_open())
        json_config << data << endl;
    
    json_config.close();
}

json read_metadata() {
    std::ifstream json_config(DEVICE_C);
    json data;
    try{
        data = json::parse(json_config);
    } catch(...) {
        json_config.close();
        data = {
            {"vendor_id", 0},
            {"product_id", 0}
        };
    }

    cout << data << endl;
    
    return data;
}

char* wchar_char(wchar_t *str1) {
    char *char_result;
    uint8_t i = 0;
    while (str1[i] != 00) {
        char_result[i] = (char)str1[i];
        i++;
    }
    
    char_result[i] = '\0';
    
    return char_result;
}

int main(void) {
    while(1) {
        {
            json data = read_metadata();
            
            struct hid_device_info *devs;
            
            hid_init();
            
            unsigned short vendor_id = static_cast<unsigned short>(data["vendor_id"]);
            unsigned short product_id = static_cast<unsigned short>(data["product_id"]);
            hid_device_info *dev = NULL;

            if (vendor_id == 0) {
                do {
                    devs = hid_enumerate(0x0, 0x0);
                    dev = find_keyboard_device(devs);
                    if(!dev)
                        sleep_for(seconds(5));
                } while(!dev);

                data["vendor_id"] = dev->vendor_id;
                data["product_id"] = dev->product_id;
                data["manufacturer_string"] = wchar_char(dev->manufacturer_string);
                data["product_string"] =  wchar_char(dev->product_string);
                data["path"] = dev->path;
            } else {
                do {
                    devs = hid_enumerate(vendor_id, product_id);
                    dev = find_keyboard_device(devs);
                    if(!dev)
                        sleep_for(seconds(5));
                } while (!dev);
                data["path"] = dev->path;
            }
            
            hid_free_enumeration(devs);
            write_metadata(data);
        }
        pid_t pid = fork();
        if(pid == 0) {
            char* argument_list[] = {"ts-node-transpile-only", "/Users/vanluv/develop/keybrd/qmk_hid/main.ts", NULL};
            execvp("ts-node-transpile-only", argument_list);
        } else {
            while (waitpid(0, NULL, 0) > 0);
        }
    }
}
